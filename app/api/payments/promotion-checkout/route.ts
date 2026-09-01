import { NextResponse } from 'next/server'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { createYocoCheckout } from '@/lib/yoco'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.businessName !== 'string' || typeof body.email !== 'string') return NextResponse.json({ error: 'Business name and email are required.' }, { status: 400 })
  try {
    const email = body.email.trim().toLowerCase()
    const businesses = await adminRequest(`businesses?email=eq.${encodeURIComponent(email)}&select=id`)
    const business = businesses[0] || (await insertAdminRecord('businesses', { name: body.businessName.trim(), email }))[0]
    const plans = await adminRequest('promotion_plans?name=eq.ConnectNetwork%20Promotion&active=eq.true&select=id,amount_cents')
    const plan = plans[0]
    if (!plan) throw new Error('Promotion plan unavailable')
    const promotion = (await insertAdminRecord('promotions', { business_id: business.id, plan_id: plan.id }))[0]
    const payment = (await insertAdminRecord('payment_transactions', { promotion_id: promotion.id, amount_cents: plan.amount_cents, state: 'pending' }))[0]
    const origin = new URL(request.url).origin
    const checkout = await createYocoCheckout({ amount: Number(plan.amount_cents), successUrl: `${origin}/api/payments/yoco/return?paymentId=${String(payment.id)}`, cancelUrl: `${origin}/promotion?payment=cancelled`, metadata: { paymentId: String(payment.id), promotionId: String(promotion.id) } })
    await adminRequest(`payment_transactions?id=eq.${payment.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ provider_payment_id: checkout.id }) })
    await insertAdminRecord('ai_events', { event_type: 'yoco_checkout_created', actor: 'payment_api', payload: { payment_id: payment.id, checkout_id: checkout.id } })
    return NextResponse.json({ checkoutUrl: checkout.redirectUrl })
  } catch { return NextResponse.json({ error: 'Unable to start payment. Please try again.' }, { status: 500 }) }
}
