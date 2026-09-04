import { NextResponse } from 'next/server'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { createYocoCheckout } from '@/lib/yoco'

type CartItem = { productId: string; quantity: number }
type Product = { id: string; supplier_id: string; name: string; retail_price_cents: number; stock_quantity: number | null }

export async function POST(request: Request) {
  const body: { email?: unknown; items?: unknown } = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const rawItems: unknown[] = Array.isArray(body.items) ? body.items : []
  const items = rawItems.filter((item): item is CartItem => {
    if (!item || typeof item !== 'object') return false
    const candidate = item as { productId?: unknown; quantity?: unknown }
    return typeof candidate.productId === 'string' && Number.isInteger(candidate.quantity) && Number(candidate.quantity) > 0 && Number(candidate.quantity) <= 10
  })
  if (!email || items.length === 0) return NextResponse.json({ error: 'An email address and at least one cart item are required.' }, { status: 400 })
  try {
    const ids = items.map(item => item.productId).join(',')
    const products = await adminRequest(`products?id=in.(${ids})&active=eq.true&select=id,supplier_id,name,retail_price_cents,stock_quantity`) as Product[]
    if (products.length !== items.length) throw new Error('One or more products are no longer available')
    const selected = items.map(item => ({ ...item, product: products.find(product => product.id === item.productId) }))
    if (selected.some(item => !item.product || item.quantity > (item.product.stock_quantity ?? Number.MAX_SAFE_INTEGER))) throw new Error('One or more products are unavailable')
    const total = selected.reduce((sum, item) => sum + item.product!.retail_price_cents * item.quantity, 0)
    const [order] = await insertAdminRecord('orders', { status: 'pending_payment', currency: 'ZAR', total_cents: total, customer_email: email })
    await Promise.all(selected.map(item => insertAdminRecord('order_items', { order_id: order.id, product_id: item.product!.id, supplier_id: item.product!.supplier_id, product_name: item.product!.name, unit_price_cents: item.product!.retail_price_cents, quantity: item.quantity })))
    const [payment] = await insertAdminRecord('payment_transactions', { order_id: order.id, amount_cents: total, state: 'pending' })
    const origin = new URL(request.url).origin
    const checkout = await createYocoCheckout({ amount: total, successUrl: `${origin}/api/payments/yoco/order-return?paymentId=${payment.id}`, cancelUrl: `${origin}/cart?payment=cancelled`, metadata: { paymentId: String(payment.id), orderId: String(order.id) } })
    await adminRequest(`payment_transactions?id=eq.${payment.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ provider_payment_id: checkout.id }) })
    return NextResponse.json({ checkoutUrl: checkout.redirectUrl })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout could not be started.' }, { status: 500 }) }
}
