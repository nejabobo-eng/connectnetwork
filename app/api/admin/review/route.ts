import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cookieName, isValidAdminSession } from '@/lib/admin-auth'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'

function authorised() { return isValidAdminSession(cookies().get(cookieName)?.value) }
export async function GET() {
  if (!authorised()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const opportunities = await adminRequest('supplier_opportunities?status=eq.ready_for_review&select=*,proposed_supplier:suppliers(*)')
    return NextResponse.json({ opportunities })
  } catch { return NextResponse.json({ error: 'Admin review is not configured' }, { status: 503 }) }
}
export async function POST(request: Request) {
  if (!authorised()) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { opportunityId } = await request.json().catch(() => ({}))
  if (typeof opportunityId !== 'string') return NextResponse.json({ error: 'Opportunity is required' }, { status: 400 })
  try {
    const [opportunity] = await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}&select=*`)
    if (!opportunity || opportunity.status !== 'ready_for_review') return NextResponse.json({ error: 'Opportunity is no longer ready for approval' }, { status: 409 })
    if (opportunity.proposed_supplier_id) await adminRequest(`suppliers?id=eq.${opportunity.proposed_supplier_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }) })
    if (opportunity.proposed_supplier_id && opportunity.proposed_product?.name) await insertAdminRecord('products', { supplier_id: opportunity.proposed_supplier_id, name: opportunity.proposed_product.name, description: opportunity.proposed_product.description || null, retail_price_cents: opportunity.proposed_product.retail_price_cents || null, stock_quantity: opportunity.proposed_product.stock_quantity || null, active: true })
    await adminRequest(`supplier_opportunities?id=eq.${encodeURIComponent(opportunityId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'approved', reviewed_at: new Date().toISOString() }) })
    await insertAdminRecord('ai_events', { event_type: 'opportunity_approved_for_publish', actor: 'admin', payload: { opportunity_id: opportunityId, supplier_id: opportunity.proposed_supplier_id } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Approval could not be completed' }, { status: 500 }) }
}
