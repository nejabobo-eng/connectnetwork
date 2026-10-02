import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cookieName, isValidAdminSession } from '@/lib/admin-auth'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { runOpportunityResearch } from '@/lib/openai'
import { categorizeCrawledProduct, crawlSupplierProduct, discoverSupplierProductUrls } from '@/lib/crawl4ai'
import { approvedCrawlSourceAt } from '@/lib/crawl-sources'
import { defaultMarkupPercent, extractSupplierListingDetails, sellingPriceFromCost } from '@/lib/supplier-listing'

type AutomationTask = {
  id: string
  task_type: string
  attempts?: number
  payload?: { order_id?: string; demand_signal?: string; source_url?: string; source_index?: number }
}

const maximumAutomaticAttempts = 3

function isRetryableFailure(message: string) {
  return /fetch failed|timeout|timed out|aborted|temporar|rate limit|status: incomplete|returned no text output|unterminated string|openai request failed: (429|5\d\d)/i.test(message)
}

function allowed(request: Request) {
  const admin = isValidAdminSession(cookies().get(cookieName)?.value)
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  return admin || Boolean(token && (token === process.env.AUTOMATION_WORKER_SECRET || token === process.env.CRON_SECRET))
}

function isDirectImageUrl(value: unknown) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && /\.(avif|gif|jpe?g|png|webp)$/i.test(url.pathname)
  } catch {
    return false
  }
}

async function run(request: Request) {
  if (!allowed(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  let task: AutomationTask | undefined
  let attemptNumber = 0
  try {
    const tasks = await adminRequest('ai_tasks?status=eq.queued&order=created_at.asc&limit=1&select=*')
    task = tasks[0] as AutomationTask | undefined
    if (!task) return NextResponse.json({ processed: false, message: 'No queued tasks' })
    attemptNumber = Number(task.attempts || 0) + 1
    await adminRequest(`ai_tasks?id=eq.${task.id}&status=eq.queued`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'running', attempts: attemptNumber, locked_at: new Date().toISOString(), locked_by: task.task_type.startsWith('crawl_') ? 'crawl4ai-operator' : 'openai-operator' }) })
    if (task.task_type === 'monitor_paid_order') {
      const orderId = String(task.payload?.order_id || '')
      const deliveries = orderId ? await adminRequest(`supplier_deliveries?order_id=eq.${encodeURIComponent(orderId)}&select=status,created_at`) : []
      const awaitingDispatch = Array.isArray(deliveries) && deliveries.some(delivery => delivery.status === 'awaiting_dispatch')
      await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: awaitingDispatch ? 'paid_order_requires_dispatch' : 'paid_order_delivery_checked', actor: 'operations_monitor', payload: { order_id: orderId, delivery_count: Array.isArray(deliveries) ? deliveries.length : 0, requires_human_action: awaitingDispatch } })
      return NextResponse.json({ processed: true, orderId, requiresHumanAction: awaitingDispatch })
    }
    if (task.task_type === 'crawl_catalogue_source') {
      const source = approvedCrawlSourceAt(Number(task.payload?.source_index) || 0)
      const candidates = await discoverSupplierProductUrls(source.catalogueUrl)
      let result: Awaited<ReturnType<typeof crawlSupplierProduct>> | undefined
      for (const candidate of candidates) {
        try {
          result = await crawlSupplierProduct(candidate)
          break
        } catch { }
      }
      if (!result) throw new Error(`Crawl4AI could not find a complete ZAR-priced product at ${source.name}.`)
      const [existingOpportunities, existingProducts] = await Promise.all([
        adminRequest(`supplier_opportunities?source_url=eq.${encodeURIComponent(result.sourceUrl)}&status=in.(researching,ready_for_review,approved)&select=id&limit=1`),
        adminRequest(`products?supplier_source_url=eq.${encodeURIComponent(result.sourceUrl)}&select=id&limit=1`),
      ])
      if (existingOpportunities.length || existingProducts.length) throw new Error('This supplier product URL is already in the approval pipeline or product catalogue.')
      const markupPercent = defaultMarkupPercent()
      const retailPriceCents = sellingPriceFromCost(result.sourcePriceCents, markupPercent)
      const supplier = (await insertAdminRecord('suppliers', { channel: 'crawler_discovered', status: 'pending_review', business_name: result.supplierName || source.name, website_url: result.supplierWebsite || source.catalogueUrl, source_url: result.sourceUrl }))[0]
      const opportunity = (await insertAdminRecord('supplier_opportunities', { status: 'ready_for_review', title: result.productName, source_url: result.sourceUrl, demand_summary: `${source.category} source crawled from ${source.name} on ${result.checkedAt}. ${result.availability ? `Availability: ${result.availability}.` : ''}`.trim(), estimated_margin: markupPercent, confidence: 1, proposed_supplier_id: supplier.id, proposed_product: { name: result.productName, description: result.productDescription || '', category: source.category || categorizeCrawledProduct(result.productName, result.productDescription), supplier_cost_cents: result.sourcePriceCents, markup_percent: markupPercent, retail_price_cents: retailPriceCents, image_url: result.imageUrls[0], source_image_urls: result.imageUrls, source_price_cents: result.sourcePriceCents, source_currency: result.currency, source_checked_at: result.checkedAt, availability: result.availability || null } }))[0]
      await insertAdminRecord('supplier_source_checks', { source_url: result.sourceUrl, supplier_id: supplier.id, source_price_cents: result.sourcePriceCents, source_currency: result.currency, source_image_urls: result.imageUrls, availability: result.availability || null, checked_at: result.checkedAt, raw_data: result })
      await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'supplier_catalogue_crawled', actor: 'crawl4ai_operator', payload: { opportunity_id: opportunity.id, supplier_id: supplier.id, source_name: source.name, source_category: source.category } })
      return NextResponse.json({ processed: true, opportunityId: opportunity.id, provider: 'crawl4ai', source: source.name, category: source.category })
    }
    if (task.task_type === 'crawl_supplier_url') {
      const sourceUrl = String(task.payload?.source_url || '')
      const existing = sourceUrl ? await adminRequest(`supplier_opportunities?source_url=eq.${encodeURIComponent(sourceUrl)}&status=in.(researching,ready_for_review,approved)&select=id&limit=1`) : []
      if (existing.length) throw new Error('This supplier product URL is already in the approval pipeline.')
      const result = await crawlSupplierProduct(sourceUrl)
      const existingProducts = await adminRequest(`products?supplier_source_url=eq.${encodeURIComponent(result.sourceUrl)}&select=id&limit=1`)
      if (existingProducts.length) throw new Error('This supplier product URL is already in the product catalogue.')
      const category = categorizeCrawledProduct(result.productName, result.productDescription)
      const markupPercent = defaultMarkupPercent()
      const retailPriceCents = sellingPriceFromCost(result.sourcePriceCents, markupPercent)
      const supplier = (await insertAdminRecord('suppliers', { channel: 'crawler_discovered', status: 'pending_review', business_name: result.supplierName || 'Unverified supplier', website_url: result.supplierWebsite || null, source_url: result.sourceUrl }))[0]
      const opportunity = (await insertAdminRecord('supplier_opportunities', { status: 'ready_for_review', title: result.productName, source_url: result.sourceUrl, demand_summary: `Supplier page crawled on ${result.checkedAt}. ${result.availability ? `Availability: ${result.availability}.` : ''}`.trim(), estimated_margin: markupPercent, confidence: 1, proposed_supplier_id: supplier.id, proposed_product: { name: result.productName, description: result.productDescription || '', category, supplier_cost_cents: result.sourcePriceCents, markup_percent: markupPercent, retail_price_cents: retailPriceCents, image_url: result.imageUrls[0], source_image_urls: result.imageUrls, source_price_cents: result.sourcePriceCents, source_currency: result.currency, source_checked_at: result.checkedAt, availability: result.availability || null } }))[0]
      await insertAdminRecord('supplier_source_checks', { source_url: result.sourceUrl, supplier_id: supplier.id, source_price_cents: result.sourcePriceCents, source_currency: result.currency, source_image_urls: result.imageUrls, availability: result.availability || null, checked_at: result.checkedAt, raw_data: result })
      await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'supplier_url_crawled', actor: 'crawl4ai_operator', payload: { opportunity_id: opportunity.id, supplier_id: supplier.id, source_url: result.sourceUrl } })
      return NextResponse.json({ processed: true, opportunityId: opportunity.id, provider: 'crawl4ai' })
    }
    if (task.task_type !== 'discover_product_opportunity') throw new Error(`Unsupported automation task: ${task.task_type}`)
    const result = await runOpportunityResearch(String(task.payload?.demand_signal || 'Find a viable South African product opportunity.'))
    const sourceUrl = String(result.source_url || '')
    const sourceDetails: { imageUrl?: string; supplierCostCents?: number } = sourceUrl ? await extractSupplierListingDetails(sourceUrl).catch(() => ({})) : {}
    const supplierCostCents = Number(result.supplier_cost_cents) || sourceDetails.supplierCostCents || null
    const confirmedSupplierCostCents = Number(supplierCostCents)
    const imageUrl = String(result.product_image_url || '') || sourceDetails.imageUrl || null
    if (String(result.supplier_country || '').toUpperCase() !== 'ZA') throw new Error('Research rejected: supplier is not confirmed as South African.')
    if (String(result.price_currency || '').toUpperCase() !== 'ZAR') throw new Error('Research rejected: supplier price is not confirmed in South African rand.')
    if (!sourceUrl.startsWith('https://')) throw new Error('Research rejected: supplier product URL is missing or invalid.')
    if (!Number.isInteger(confirmedSupplierCostCents) || confirmedSupplierCostCents <= 0) throw new Error('Research rejected: supplier cost is missing or invalid.')
    if (!isDirectImageUrl(imageUrl)) throw new Error('Research rejected: a direct supplier product image is required.')
    const markupPercent = defaultMarkupPercent()
    const retailPriceCents = sellingPriceFromCost(confirmedSupplierCostCents, markupPercent)
    const rawConfidence = Number(result.confidence)
    const confidence = Number.isFinite(rawConfidence) && rawConfidence >= 0 ? Math.min(rawConfidence > 1 ? rawConfidence / 100 : rawConfidence, 1) : null
    const supplier = (await insertAdminRecord('suppliers', { channel: 'ai_discovered', status: 'pending_review', business_name: String(result.supplier_name || 'Unverified supplier'), website_url: String(result.supplier_website || '') || null, source_url: String(result.source_url || '') || null }))[0]
    const opportunity = (await insertAdminRecord('supplier_opportunities', { status: 'ready_for_review', title: String(result.title || 'AI discovered opportunity'), source_url: sourceUrl || null, demand_summary: String(result.demand_summary || ''), estimated_margin: markupPercent, confidence, proposed_supplier_id: supplier.id, proposed_product: { name: String(result.product_name || result.title || 'Unspecified product'), description: String(result.product_description || ''), category: String(result.product_category || 'Other'), supplier_cost_cents: confirmedSupplierCostCents, markup_percent: markupPercent, retail_price_cents: retailPriceCents, image_url: imageUrl } }))[0]
    await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
    await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'opportunity_researched', actor: 'openai_operator', payload: { opportunity_id: opportunity.id, supplier_id: supplier.id, model: process.env.OPENAI_MODEL || 'gpt-5' } })
    return NextResponse.json({ processed: true, opportunityId: opportunity.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown failure'
    if (task?.id && attemptNumber < maximumAutomaticAttempts && isRetryableFailure(message)) {
      await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'queued', available_at: new Date().toISOString(), locked_at: null, locked_by: null, completed_at: null }) }).catch(() => undefined)
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'automation_retry_scheduled', actor: 'openai_operator', payload: { message, attempt: attemptNumber, maximum_attempts: maximumAutomaticAttempts } }).catch(() => undefined)
      return NextResponse.json({ processed: false, retryScheduled: true, attempt: attemptNumber, maximumAttempts: maximumAutomaticAttempts })
    }
    if (task?.id) await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'failed', completed_at: new Date().toISOString() }) }).catch(() => undefined)
    await insertAdminRecord('ai_events', { task_id: typeof task?.id === 'string' ? task.id : undefined, event_type: 'automation_failed', actor: 'openai_operator', payload: { message } }).catch(() => undefined)
    return NextResponse.json({ error: 'Automation task failed', taskId: task?.id }, { status: 500 })
  }
}

export const GET = run
export const POST = run
