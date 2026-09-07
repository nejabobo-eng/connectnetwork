import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cookieName, isValidAdminSession } from '@/lib/admin-auth'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { runOpportunityResearch } from '@/lib/openai'

function allowed(request: Request) {
  const admin = isValidAdminSession(cookies().get(cookieName)?.value)
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  return admin || Boolean(token && (token === process.env.AUTOMATION_WORKER_SECRET || token === process.env.CRON_SECRET))
}

async function run(request: Request) {
  if (!allowed(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const tasks = await adminRequest('ai_tasks?status=eq.queued&order=created_at.asc&limit=1&select=*')
    const task = tasks[0]
    if (!task) return NextResponse.json({ processed: false, message: 'No queued tasks' })
    await adminRequest(`ai_tasks?id=eq.${task.id}&status=eq.queued`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'running', locked_at: new Date().toISOString(), locked_by: 'openai-operator' }) })
    if (task.task_type === 'monitor_paid_order') {
      const orderId = String(task.payload?.order_id || '')
      const deliveries = orderId ? await adminRequest(`supplier_deliveries?order_id=eq.${encodeURIComponent(orderId)}&select=status,created_at`) : []
      const awaitingDispatch = Array.isArray(deliveries) && deliveries.some(delivery => delivery.status === 'awaiting_dispatch')
      await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
      await insertAdminRecord('ai_events', { task_id: task.id, event_type: awaitingDispatch ? 'paid_order_requires_dispatch' : 'paid_order_delivery_checked', actor: 'operations_monitor', payload: { order_id: orderId, delivery_count: Array.isArray(deliveries) ? deliveries.length : 0, requires_human_action: awaitingDispatch } })
      return NextResponse.json({ processed: true, orderId, requiresHumanAction: awaitingDispatch })
    }
    if (task.task_type !== 'discover_product_opportunity') throw new Error(`Unsupported automation task: ${task.task_type}`)
    const result = await runOpportunityResearch(String(task.payload?.demand_signal || 'Find a viable South African product opportunity.'))
    const supplier = (await insertAdminRecord('suppliers', { channel: 'ai_discovered', status: 'pending_review', business_name: String(result.supplier_name || 'Unverified supplier'), website_url: String(result.supplier_website || '') || null, source_url: String(result.source_url || '') || null }))[0]
    const opportunity = (await insertAdminRecord('supplier_opportunities', { status: 'ready_for_review', title: String(result.title || 'AI discovered opportunity'), source_url: String(result.source_url || '') || null, demand_summary: String(result.demand_summary || ''), estimated_margin: Number(result.estimated_margin) || null, confidence: Number(result.confidence) || null, proposed_supplier_id: supplier.id, proposed_product: { name: String(result.product_name || result.title || 'Unspecified product'), description: String(result.product_description || ''), retail_price_cents: Number(result.retail_price_cents) || null } }))[0]
    await adminRequest(`ai_tasks?id=eq.${task.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() }) })
    await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'opportunity_researched', actor: 'openai_operator', payload: { opportunity_id: opportunity.id, supplier_id: supplier.id, model: process.env.OPENAI_MODEL || 'gpt-5' } })
    return NextResponse.json({ processed: true, opportunityId: opportunity.id })
  } catch (error) {
    await insertAdminRecord('ai_events', { event_type: 'automation_failed', actor: 'openai_operator', payload: { message: error instanceof Error ? error.message : 'Unknown failure' } }).catch(() => undefined)
    return NextResponse.json({ error: 'Automation task failed' }, { status: 500 })
  }
}

export const GET = run
export const POST = run
