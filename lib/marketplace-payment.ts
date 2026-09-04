import { adminRequest } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'

type PaymentRecord = {
  id: string
  order_id: string
  provider_payment_id: string | null
}

function isPaidStatus(status: unknown) {
  return ['succeeded', 'successful', 'paid'].includes(String(status).toLowerCase())
}

export async function verifyMarketplacePayment(paymentId: string) {
  const payments = await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}&select=id,order_id,provider_payment_id`)
  const payment = payments[0] as PaymentRecord | undefined

  if (!payment?.provider_payment_id) throw new Error('Payment not found')

  const checkout = await getYocoCheckout(payment.provider_payment_id)
  if (!isPaidStatus(checkout.status)) return { paid: false, status: checkout.status }

  await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ state: 'succeeded' }),
  })
  await adminRequest(`orders?id=eq.${encodeURIComponent(payment.order_id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'paid' }),
  })

  return { paid: true, status: checkout.status }
}
