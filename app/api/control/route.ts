import { NextResponse } from 'next/server'
import { hasControlApiAccess } from '@/lib/control-api'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'

async function approveOpportunity(opportunityId: string) {
  const [opportunity] = await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}&select=*`)
  if (!opportunity || opportunity.status !== 'ready_for_review') throw new Error('Opportunity is no longer ready for approval')
  if (opportunity.proposed_supplier_id) await adminRequest(`suppliers?id=eq.${opportunity.proposed_supplier_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }) })
  if (opportunity.proposed_supplier_id && opportunity.proposed_product?.name) await insertAdminRecord('products', { supplier_id: opportunity.proposed_supplier_id, name: opportunity.proposed_product.name, description: opportunity.proposed_product.description || null, retail_price_cents: opportunity.proposed_product.retail_price_cents || null, stock_quantity: opportunity.proposed_product.stock_quantity || null, active: true })
  await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }) })
  await insertAdminRecord('ai_events', { event_type: 'opportunity_approved_for_publish', actor: 'admin', payload: { opportunity_id: opportunityId, supplier_id: opportunity.proposed_supplier_id } })
}

export async function GET(request: Request) {
  if (!hasControlApiAccess(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const [opportunities, suppliers, promotions, payments, queuedTasks] = await Promise.all([
      adminRequest('supplier_opportunities?status=eq.ready_for_review&select=*,proposed_supplier:suppliers(*)'),
      adminRequest('suppliers?select=id'),
      adminRequest('promotions?select=id,status'),
      adminRequest('payment_transactions?select=id,state'),
      adminRequest('ai_tasks?status=eq.queued&select=id')
    ])
    return NextResponse.json({ opportunities, metrics: { suppliers: suppliers.length, activePromotions: promotions.filter((promotion: Record<string, unknown>) => promotion.status === 'active').length, successfulPayments: payments.filter((payment: Record<string, unknown>) => payment.state === 'succeeded').length, queuedTasks: queuedTasks.length } })
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
    return NextResponse.json({ error: 'Invalid control action' }, { status: 400 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Control action failed' }, { status:500 }) }
}
