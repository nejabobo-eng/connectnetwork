import { NextResponse } from 'next/server'
import { adminRequest } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const redirect = new URL('/cart', request.url)
  const paymentId = new URL(request.url).searchParams.get('paymentId')
  if (!paymentId) {
    redirect.searchParams.set('payment', 'cancelled')
    return NextResponse.redirect(redirect)
  }

  try {
    const [payment] = await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}&select=id,order_id,state`)
    if (payment?.state !== 'succeeded') {
      await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ state: 'cancelled' }) })
      if (payment?.order_id) await adminRequest(`orders?id=eq.${encodeURIComponent(payment.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'cancelled' }) })
    }
  } catch {
    redirect.searchParams.set('payment', 'cancelled')
    return NextResponse.redirect(redirect)
  }

  redirect.searchParams.set('payment', 'cancelled')
  return NextResponse.redirect(redirect)
}
