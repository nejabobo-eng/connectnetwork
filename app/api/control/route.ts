import { NextResponse } from 'next/server'
import { hasControlApiAccess } from '@/lib/control-api'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { defaultMarkupPercent, extractSupplierListingDetails, sellingPriceFromCost } from '@/lib/supplier-listing'
import { requestDeliveryQuote, type DeliveryQuote } from '@/lib/delivery-quote'
import { classifyProductCategory } from '@/lib/openai'

type ProposedProduct = {
  name?: unknown
  description?: unknown
  stock_quantity?: unknown
  retail_price_cents?: unknown
  supplier_cost_cents?: unknown
  category?: unknown
  image_url?: unknown
}

function confirmedListingDetails(product: ProposedProduct | null | undefined) {
  const retailPriceCents = typeof product?.retail_price_cents === 'number' ? product.retail_price_cents : NaN
  const supplierCostCents = typeof product?.supplier_cost_cents === 'number' ? product.supplier_cost_cents : NaN
  const imageUrl = typeof product?.image_url === 'string' ? product.image_url.trim() : ''

  if (!Number.isInteger(retailPriceCents) || retailPriceCents <= 0) throw new Error('Add a confirmed retail price before approval.')
  if (!Number.isInteger(supplierCostCents) || supplierCostCents <= 0) throw new Error('Add a confirmed supplier cost before approval.')
  try {
    const url = new URL(imageUrl)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
  } catch {
    throw new Error('Add a valid supplier product image URL before approval.')
  }

  return { retailPriceCents, supplierCostCents, imageUrl }
}

async function approveOpportunity(opportunityId: string) {
  const [opportunity] = await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}&select=*`)
  if (!opportunity || opportunity.status !== 'ready_for_review') throw new Error('Opportunity is no longer ready for approval')
  if (!opportunity.proposed_supplier_id || !opportunity.proposed_product?.name) throw new Error('This opportunity does not contain a supplier and product to publish.')
  const { retailPriceCents, supplierCostCents, imageUrl } = confirmedListingDetails(opportunity.proposed_product)
  if (opportunity.proposed_supplier_id) await adminRequest(`suppliers?id=eq.${opportunity.proposed_supplier_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }) })
  await insertAdminRecord('products', { supplier_id: opportunity.proposed_supplier_id, name: opportunity.proposed_product.name, description: opportunity.proposed_product.description || null, category: typeof opportunity.proposed_product.category === 'string' ? opportunity.proposed_product.category : 'Other', supplier_cost_cents: supplierCostCents, retail_price_cents: retailPriceCents, stock_quantity: opportunity.proposed_product.stock_quantity || null, image_url: imageUrl, active: true })
  await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }) })
  await insertAdminRecord('ai_events', { event_type: 'opportunity_approved_for_publish', actor: 'admin', payload: { opportunity_id: opportunityId, supplier_id: opportunity.proposed_supplier_id } })
}

async function discardOpportunity(opportunityId: string) {
  const [opportunity] = await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}&select=id,status`)
  if (!opportunity || opportunity.status !== 'ready_for_review') throw new Error('This opportunity is no longer available for review.')
  await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'rejected', reviewed_at: new Date().toISOString() }) })
  await insertAdminRecord('ai_events', { event_type: 'opportunity_discarded', actor: 'admin', payload: { opportunity_id: opportunityId } })
}

async function updateOpportunityDetails(opportunityId: string, retailPriceCents: unknown, imageUrl: unknown) {
  const [opportunity] = await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}&select=id,status,proposed_product`)
  if (!opportunity || opportunity.status !== 'ready_for_review') throw new Error('Opportunity is no longer ready for editing')
  const details = confirmedListingDetails({ ...opportunity.proposed_product, retail_price_cents: retailPriceCents, image_url: imageUrl })
  await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ proposed_product: { ...opportunity.proposed_product, retail_price_cents: details.retailPriceCents, image_url: details.imageUrl } }) })
}

async function createManualProduct(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const supplierName = typeof body.supplierName === 'string' ? body.supplierName.trim() : ''
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : ''
  const supplierCostCents = Number(body.supplierCostCents)
  if (!name || !supplierName || !imageUrl || !Number.isInteger(supplierCostCents) || supplierCostCents <= 0) throw new Error('Name, supplier, image, and a supplier cost above zero are required.')
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const shippingWeightGrams = Number(body.shippingWeightGrams)
  const shippingLengthCm = Number(body.shippingLengthCm)
  const shippingWidthCm = Number(body.shippingWidthCm)
  const shippingHeightCm = Number(body.shippingHeightCm)
  const bulkySurchargeCents = Math.round(Number(body.bulkySurcharge) * 100)
  const deliveryOverrideCents = typeof body.deliveryOverride === 'string' && body.deliveryOverride.trim() !== '' ? Math.round(Number(body.deliveryOverride) * 100) : null
  if (![shippingWeightGrams, shippingLengthCm, shippingWidthCm, shippingHeightCm].every(value => Number.isFinite(value) && value > 0)) throw new Error('Enter a valid product weight and package dimensions.')
  if (!Number.isInteger(bulkySurchargeCents) || bulkySurchargeCents < 0 || (deliveryOverrideCents !== null && (!Number.isInteger(deliveryOverrideCents) || deliveryOverrideCents < 0))) throw new Error('Enter valid bulky and delivery override amounts.')
  const category = await classifyProductCategory(name, description, typeof body.category === 'string' ? body.category.trim() : undefined)
  const [supplier] = await insertAdminRecord('suppliers', { channel: 'connected', status: 'approved', business_name: supplierName, contact_name: typeof body.supplierContact === 'string' ? body.supplierContact.trim() || null : null, phone: typeof body.supplierPhone === 'string' ? body.supplierPhone.trim() || null : null, website_url: typeof body.supplierUrl === 'string' ? body.supplierUrl.trim() || null : null, reviewed_at: new Date().toISOString() })
  const retailPriceCents = sellingPriceFromCost(supplierCostCents)
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${crypto.randomUUID().slice(0, 6)}`
  await insertAdminRecord('products', { supplier_id: supplier.id, name, slug, description: description || null, category, image_url: imageUrl, supplier_cost_cents: supplierCostCents, retail_price_cents: retailPriceCents, shipping_weight_grams: Math.round(shippingWeightGrams), shipping_length_cm: shippingLengthCm, shipping_width_cm: shippingWidthCm, shipping_height_cm: shippingHeightCm, bulky_surcharge_cents: bulkySurchargeCents, delivery_override_cents: deliveryOverrideCents, active: true })
  return { retailPriceCents, category }
}

async function enrichOpportunityListing(opportunityId: string) {
  const [opportunity] = await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}&select=id,status,source_url,proposed_product`)
  if (!opportunity || opportunity.status !== 'ready_for_review') throw new Error('Opportunity is no longer ready for editing')
  if (typeof opportunity.source_url !== 'string' || !opportunity.source_url) throw new Error('This opportunity has no supplier source page to check.')
  const found = await extractSupplierListingDetails(opportunity.source_url)
  const currentCost = Number(opportunity.proposed_product?.supplier_cost_cents) || Number(opportunity.proposed_product?.retail_price_cents) || 0
  const supplierCostCents = found.supplierCostCents || (Number.isInteger(currentCost) && currentCost > 0 ? currentCost : null)
  const markupPercent = defaultMarkupPercent()
  const retailPriceCents = supplierCostCents ? sellingPriceFromCost(supplierCostCents, markupPercent) : null
  const imageUrl = found.imageUrl || opportunity.proposed_product?.image_url || null
  await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ estimated_margin: markupPercent, proposed_product: { ...opportunity.proposed_product, supplier_cost_cents: supplierCostCents, markup_percent: markupPercent, retail_price_cents: retailPriceCents, image_url: imageUrl } }) })
}

async function fulfilmentOrders() {
  const orders = await adminRequest('orders?status=in.(paid,processing)&select=id,status,total_cents,delivery_fee_cents,customer_email,delivery_address,delivery_phone,delivery_status,delivery_provider,delivery_quote_cents,created_at&order=created_at.asc') as Array<Record<string, unknown>>
  const orderIds = orders.map(order => String(order.id)).filter(Boolean)
  if (!orderIds.length) return []
  const items = await adminRequest(`order_items?order_id=in.(${orderIds.join(',')})&select=order_id,product_id,supplier_id,product_name,unit_price_cents,quantity,products(retail_price_cents,supplier_cost_cents,suppliers(business_name,source_url,website_url))`) as Array<Record<string, unknown>>
  let deliveries = await adminRequest(`supplier_deliveries?order_id=in.(${orderIds.join(',')})&select=id,order_id,supplier_id,status,internal_reference,supplier_reference,tracking_number,carrier,procurement_url,procurement_cost_cents,handling_notes,dispatched_at`) as Array<Record<string, unknown>>
  const existing = new Set(deliveries.map(delivery => `${delivery.order_id}:${delivery.supplier_id}`))
  const missing = items.filter(item => !existing.has(`${item.order_id}:${item.supplier_id}`))
  if (missing.length) {
    await Promise.all(missing.map(item => adminRequest('supplier_deliveries', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ order_id: item.order_id, supplier_id: item.supplier_id, product_id: item.product_id, status: 'awaiting_dispatch' }) })))
    deliveries = await adminRequest(`supplier_deliveries?order_id=in.(${orderIds.join(',')})&select=id,order_id,supplier_id,status,internal_reference,supplier_reference,tracking_number,carrier,procurement_url,procurement_cost_cents,handling_notes,dispatched_at`) as Array<Record<string, unknown>>
  }
  return orders.map(order => {
    const orderItems = items.filter(item => item.order_id === order.id)
    const orderDeliveries = deliveries.filter(delivery => delivery.order_id === order.id).map(delivery => {
      const product = orderItems.find(item => item.supplier_id === delivery.supplier_id)?.products as { supplier_cost_cents?: unknown } | undefined
      return { ...delivery, supplier_cost_cents: Number(product?.supplier_cost_cents) || null }
    })
    return { ...order, items: orderItems, deliveries: orderDeliveries }
  })
}

async function updateFulfilment(body: Record<string, unknown>) {
  const deliveryId = typeof body.deliveryId === 'string' ? body.deliveryId : ''
  if (!deliveryId) throw new Error('Select a delivery record first.')
  const [delivery] = await adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}&select=id,order_id`)
  if (!delivery) throw new Error('Delivery record was not found.')

  if (body.action === 'mark-ordered') {
    const procurementCostCents = Number(body.procurementCostCents)
    const supplierReference = typeof body.supplierReference === 'string' ? body.supplierReference.trim() : ''
    if (!supplierReference) throw new Error('Enter the supplier order reference before marking this order as placed.')
    if (!Number.isInteger(procurementCostCents) || procurementCostCents < 0) throw new Error('Enter the confirmed supplier cost before marking this order as placed.')
    const patch = { supplier_reference: supplierReference, procurement_url: typeof body.procurementUrl === 'string' ? body.procurementUrl.trim() || null : null, procurement_cost_cents: procurementCostCents, handling_notes: typeof body.notes === 'string' ? body.notes.trim() || null : null }
    await adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) })
    const [order] = await adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}&select=delivery_address`)
    const quote: DeliveryQuote = order?.delivery_address?.line1 && order?.delivery_address?.suburb && order?.delivery_address?.city && order?.delivery_address?.postalCode ? await requestDeliveryQuote(order.delivery_address).catch(() => ({ available: false })) : { available: false }
    await adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'processing', ...(quote.available ? { delivery_provider: quote.provider, delivery_quote_cents: quote.amountCents, delivery_status: 'awaiting_dispatch' } : {}) }) })
    return quote.available ? `Order marked as placed. Delivery quote: R${(quote.amountCents! / 100).toFixed(2)}.` : 'Order marked as placed. Delivery quote will be requested when a courier provider is connected.'
  }
  if (body.action === 'add-tracking') {
    const trackingNumber = typeof body.trackingNumber === 'string' ? body.trackingNumber.trim() : ''
    if (!trackingNumber) throw new Error('Enter a tracking number.')
    await adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ tracking_number: trackingNumber, carrier: typeof body.carrier === 'string' ? body.carrier.trim() || null : null, status: 'dispatched', dispatched_at: new Date().toISOString() }) })
    await adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'processing', delivery_status: 'dispatched' }) })
    return 'Tracking details saved and order marked as dispatched.'
  }
  if (body.action === 'cancel-order') {
    await Promise.all([
      adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'failed' }) }),
      adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'cancelled', delivery_status: 'exception' }) }),
    ])
    await insertAdminRecord('ai_events', { event_type: 'refund_review_required', actor: 'admin', payload: { order_id: delivery.order_id, delivery_id: deliveryId } })
    return 'Order cancelled. A refund review has been recorded.'
  }
  throw new Error('Invalid fulfilment action.')
}

async function setManualDeliveryQuote(orderId: string, deliveryQuoteCents: unknown) {
  const amount = Number(deliveryQuoteCents)
  if (!orderId || !Number.isInteger(amount) || amount < 0) throw new Error('Enter a valid delivery amount.')
  await adminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ delivery_provider: 'Manual supplier/courier quote', delivery_quote_cents: amount, delivery_status: 'quoted' }) })
}

async function markOrderDelivered(orderId: string) {
  if (!orderId) throw new Error('Select an order first.')
  await Promise.all([
    adminRequest(`supplier_deliveries?order_id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'delivered', dispatched_at: new Date().toISOString() }) }),
    adminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'fulfilled', delivery_status: 'delivered' }) }),
  ])
}

async function updateProduct(body: Record<string, unknown>) {
  const productId = typeof body.productId === 'string' ? body.productId : ''
  if (!productId) throw new Error('Select a product first.')
  const lifecycleStatus = ['active', 'paused', 'out_of_stock', 'archived'].includes(String(body.lifecycleStatus)) ? String(body.lifecycleStatus) : 'paused'
  const suppliedCost = Number(body.supplierCostCents)
  const hasSuppliedCost = Number.isInteger(suppliedCost) && suppliedCost >= 0
  const changes: Record<string, unknown> = { lifecycle_status: lifecycleStatus, active: lifecycleStatus === 'active' || lifecycleStatus === 'out_of_stock', updated_at: new Date().toISOString() }
  if (typeof body.imageUrl === 'string') {
    const imageUrl = body.imageUrl.trim()
    try { new URL(imageUrl) } catch { throw new Error('Enter a valid product image URL.') }
    changes.image_url = imageUrl
  }
  if (hasSuppliedCost) {
    changes.supplier_cost_cents = suppliedCost
    changes.retail_price_cents = sellingPriceFromCost(suppliedCost)
  }
  await adminRequest(`products?id=eq.${encodeURIComponent(productId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) })
  const supplierId = typeof body.supplierId === 'string' ? body.supplierId : ''
  if (supplierId && typeof body.supplierProductUrl === 'string') {
    const supplierProductUrl = body.supplierProductUrl.trim()
    try { new URL(supplierProductUrl) } catch { throw new Error('Enter a valid supplier product URL.') }
    await adminRequest(`suppliers?id=eq.${encodeURIComponent(supplierId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ source_url: supplierProductUrl }) })
  }
}

async function archiveProductsWithoutCost() {
  const changes = { lifecycle_status: 'archived', active: false, updated_at: new Date().toISOString() }
  await Promise.all([
    adminRequest('products?supplier_cost_cents=is.null', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) }),
    adminRequest('products?supplier_cost_cents=lte.0', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) }),
  ])
}

async function permanentlyDeleteProduct(productId: string) {
  const [product] = await adminRequest(`products?id=eq.${encodeURIComponent(productId)}&select=id,lifecycle_status`)
  if (!product) throw new Error('Product was not found.')
  if (product.lifecycle_status !== 'archived') throw new Error('Archive this product before permanently deleting it.')
  const [orderItems, deliveries] = await Promise.all([
    adminRequest(`order_items?product_id=eq.${encodeURIComponent(productId)}&select=id&limit=1`),
    adminRequest(`supplier_deliveries?product_id=eq.${encodeURIComponent(productId)}&select=id&limit=1`),
  ])
  if (orderItems.length || deliveries.length) throw new Error('This product has order history and must remain archived to protect records.')
  await adminRequest(`products?id=eq.${encodeURIComponent(productId)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
}

export async function GET(request: Request) {
  if (!hasControlApiAccess(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const [opportunities, suppliers, promotions, payments, queuedTasks, attentionEvents, discardedEvents, orders, products] = await Promise.all([
      adminRequest('supplier_opportunities?status=eq.ready_for_review&select=*,proposed_supplier:suppliers(*)'),
      adminRequest('suppliers?select=id'),
      adminRequest('promotions?select=id,status'),
      adminRequest('payment_transactions?select=id,state'),
      adminRequest('ai_tasks?status=eq.queued&select=id'),
      adminRequest('ai_events?event_type=in.(automation_failed,paid_order_requires_dispatch)&select=id,task_id,event_type,payload,created_at&order=created_at.desc&limit=50'),
      adminRequest('ai_events?event_type=eq.attention_discarded&select=payload'),
      fulfilmentOrders(),
      adminRequest('products?select=id,name,category,image_url,retail_price_cents,supplier_cost_cents,stock_quantity,lifecycle_status,updated_at,supplier:suppliers(id,source_url,website_url)&order=updated_at.desc'),
    ])
    const discardedIds = new Set(discardedEvents.map((event: { payload?: { event_id?: unknown } }) => event.payload?.event_id).filter((eventId: unknown): eventId is string => typeof eventId === 'string'))
    return NextResponse.json({ opportunities, orders, products, attentionEvents: attentionEvents.filter((event: { id: string }) => !discardedIds.has(event.id)), metrics: { suppliers: suppliers.length, activePromotions: promotions.filter((promotion: Record<string, unknown>) => promotion.status === 'active').length, successfulPayments: payments.filter((payment: Record<string, unknown>) => payment.state === 'succeeded').length, queuedTasks: queuedTasks.length } })
  } catch { return NextResponse.json({ error: 'Control plane is not configured' }, { status: 503 }) }
}

export async function POST(request: Request) {
  if (!hasControlApiAccess(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  try {
    if (body.action === 'queue-discovery' && typeof body.demandSignal === 'string' && body.demandSignal.trim().length >= 10) {
      const demandSignal = body.demandSignal.trim().slice(0, 2000)
      const [task] = await insertAdminRecord('ai_tasks', { task_type: 'discover_product_opportunity', payload: { demand_signal: demandSignal } })
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'discovery_task_queued', actor: 'admin', payload: { demand_signal: demandSignal } })
      return NextResponse.json({ id: task.id }, { status: 201 })
    }
    if (body.action === 'approve-opportunity' && typeof body.opportunityId === 'string') {
      await approveOpportunity(body.opportunityId)
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'discard-opportunity' && typeof body.opportunityId === 'string') {
      await discardOpportunity(body.opportunityId)
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'update-opportunity-details' && typeof body.opportunityId === 'string') {
      await updateOpportunityDetails(body.opportunityId, body.retailPriceCents, body.imageUrl)
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'enrich-opportunity-listing' && typeof body.opportunityId === 'string') {
      await enrichOpportunityListing(body.opportunityId)
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'create-manual-product') return NextResponse.json({ ok: true, ...(await createManualProduct(body)) })
    if (body.action === 'update-product') { await updateProduct(body); return NextResponse.json({ ok: true }) }
    if (body.action === 'archive-products-without-cost') { await archiveProductsWithoutCost(); return NextResponse.json({ ok: true }) }
    if (body.action === 'permanently-delete-product' && typeof body.productId === 'string') { await permanentlyDeleteProduct(body.productId); return NextResponse.json({ ok: true }) }
    if (body.action === 'set-manual-delivery-quote' && typeof body.orderId === 'string') { await setManualDeliveryQuote(body.orderId, body.deliveryQuoteCents); return NextResponse.json({ ok: true, message: 'Delivery amount saved.' }) }
    if (body.action === 'mark-order-delivered' && typeof body.orderId === 'string') { await markOrderDelivered(body.orderId); return NextResponse.json({ ok: true, message: 'Order marked as delivered.' }) }
    if (['mark-ordered', 'add-tracking', 'cancel-order'].includes(String(body.action))) {
      return NextResponse.json({ ok: true, message: await updateFulfilment(body) })
    }
    if (body.action === 'retry-task' && typeof body.taskId === 'string') {
      const [task] = await adminRequest(`ai_tasks?id=eq.${encodeURIComponent(body.taskId)}&select=id,status,locked_at`)
      const staleRunningTask = task?.status === 'running' && task.locked_at && Date.parse(task.locked_at) < Date.now() - 5 * 60 * 1000
      if (!task || (task.status !== 'failed' && !staleRunningTask)) throw new Error('This task is not ready to retry yet')
      await adminRequest(`ai_tasks?id=eq.${encodeURIComponent(body.taskId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'queued', available_at: new Date().toISOString(), locked_at: null, locked_by: null, completed_at: null }) })
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'automation_task_requeued', actor: 'admin', payload: {} })
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'discard-attention' && typeof body.eventId === 'string') {
      const [event] = await adminRequest(`ai_events?id=eq.${encodeURIComponent(body.eventId)}&event_type=in.(automation_failed,paid_order_requires_dispatch)&select=id,task_id,event_type`)
      if (!event) throw new Error('This attention item is no longer available')
      await insertAdminRecord('ai_events', { task_id: event.task_id || null, event_type: 'attention_discarded', actor: 'admin', payload: { event_id: event.id, original_event_type: event.event_type } })
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'run-automation') {
      const secret = process.env.AUTOMATION_WORKER_SECRET || process.env.CRON_SECRET
      if (!secret) throw new Error('Automation worker is not configured')
      const response = await fetch(new URL('/api/automation/run', request.url), {
        headers: { Authorization: `Bearer ${secret}` },
        cache: 'no-store',
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Automation worker could not be started')
      return NextResponse.json(result)
    }
    return NextResponse.json({ error: 'Invalid control action' }, { status: 400 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Control action failed' }, { status:500 }) }
}
