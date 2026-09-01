import { NextResponse } from 'next/server'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url); const paymentId = requestUrl.searchParams.get('paymentId'); const redirect = new URL('/promotion', request.url)
  if (!paymentId) { redirect.searchParams.set('payment', 'invalid'); return NextResponse.redirect(redirect) }
  try {
    const [payment] = await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}&select=*`)
    if (!payment?.provider_payment_id) throw new Error('Payment not found')
    const checkout = await getYocoCheckout(payment.provider_payment_id)
    if (checkout.status !== 'succeeded') { redirect.searchParams.set('payment', 'pending'); return NextResponse.redirect(redirect) }
    await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ state: 'succeeded' }) })
    if (payment.promotion_id) await adminRequest(`promotions?id=eq.${payment.promotion_id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'active', starts_at: new Date().toISOString() }) })
    await insertAdminRecord('ai_events', { event_type: 'yoco_payment_confirmed', actor: 'payment_api', payload: { payment_id: paymentId, checkout_id: checkout.id } })
    redirect.searchParams.set('payment', 'success')
  } catch { redirect.searchParams.set('payment', 'verification_failed') }
  return NextResponse.redirect(redirect)
}
