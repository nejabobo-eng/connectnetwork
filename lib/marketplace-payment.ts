import { adminRequest } from '@/lib/supabase-admin'
import { getYocoCheckout } from '@/lib/yoco'
import { sendOrderConfirmation } from '@/lib/transactional-email'

type PaymentRecord = {
  id: string
  order_id: string
  provider_payment_id: string | null
  state: string | null
}

type OrderRecord = { id: string; customer_email: string | null; total_cents: number }
type OrderItemRecord = { supplier_id: string; product_id: string; product_name: string }

function isPaidStatus(status: unknown) {
  return ['succeeded', 'successful', 'paid', 'completed', 'complete'].includes(String(status).toLowerCase())
}

async function preparePaidOrder(orderId: string) {
  const [order] = await adminRequest(`orders?id=eq.${encodeURIComponent(orderId)}&select=id,customer_email,total_cents`) as OrderRecord[]
  if (!order?.customer_email) return
  const items = await adminRequest(`order_items?order_id=eq.${encodeURIComponent(orderId)}&select=supplier_id,product_id,product_name`) as OrderItemRecord[]
  const supplierProducts = new Map<string, OrderItemRecord>()
  items.forEach(item => { if (!supplierProducts.has(item.supplier_id)) supplierProducts.set(item.supplier_id, item) })

  await Promise.allSettled([
    ...Array.from(supplierProducts.values()).map(item => adminRequest(`supplier_deliveries?order_id=eq.${encodeURIComponent(orderId)}&supplier_id=eq.${encodeURIComponent(item.supplier_id)}&select=id`).then(async deliveries => {
      if (!Array.isArray(deliveries) || deliveries.length === 0) await adminRequest('supplier_deliveries', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ order_id: orderId, supplier_id: item.supplier_id, product_id: item.product_id, status: 'awaiting_dispatch' }) })
    })),
    adminRequest('ai_tasks', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ task_type: 'monitor_paid_order', payload: { order_id: orderId } }) }),
    sendOrderConfirmation({ orderId, email: order.customer_email, totalCents: order.total_cents, itemNames: items.map(item => item.product_name) }),
  ])
}

export async function verifyMarketplacePayment(paymentId: string) {
  const payments = await adminRequest(`payment_transactions?id=eq.${encodeURIComponent(paymentId)}&select=id,order_id,provider_payment_id,state`)
  const payment = payments[0] as PaymentRecord | undefined

  if (!payment?.provider_payment_id) throw new Error('Payment not found')
  if (payment.state === 'succeeded') return { paid: true, status: payment.state }

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

  await preparePaidOrder(payment.order_id)

  return { paid: true, status: checkout.status }
}
