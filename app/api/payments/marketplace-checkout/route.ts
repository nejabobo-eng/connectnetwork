import { NextResponse } from 'next/server'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { createSupabaseServerClient } from '@/lib/supabase-auth'
import { createYocoCheckout } from '@/lib/yoco'
import { deliveryFeeFromHighestPricedItem, type ShippableProduct } from '@/lib/delivery-pricing'

type CartItem = { productId: string; quantity: number }
type Product = ShippableProduct & { id: string; name: string; retail_price_cents: number | null; stock_quantity: number | null }
type DeliveryAddress = { line1?: unknown; suburb?: unknown; city?: unknown; postalCode?: unknown; mapUrl?: unknown }

export async function POST(request: Request) {
  const body: { items?: unknown; deliveryAddress?: DeliveryAddress; deliveryPhone?: unknown } = await request.json().catch(() => ({}))
  const rawItems: unknown[] = Array.isArray(body.items) ? body.items : []
  const items = rawItems.filter((item): item is CartItem => {
    if (!item || typeof item !== 'object') return false
    const candidate = item as { productId?: unknown; quantity?: unknown }
    return typeof candidate.productId === 'string' && Number.isInteger(candidate.quantity) && Number(candidate.quantity) > 0 && Number(candidate.quantity) <= 10
  })
  if (items.length === 0) return NextResponse.json({ error: 'Add at least one cart item before checking out.' }, { status: 400 })
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    const email = user?.email?.trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Please sign in before checking out.' }, { status: 401 })
    const address = body.deliveryAddress
    const mapUrl = typeof address?.mapUrl === 'string' ? address.mapUrl.trim() : ''
    if (mapUrl) {
      try {
        const url = new URL(mapUrl)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
      } catch {
        return NextResponse.json({ error: 'Enter a valid Google Maps or delivery-location link.' }, { status: 400 })
      }
    }
    const deliveryAddress = { line1: typeof address?.line1 === 'string' ? address.line1.trim() : '', suburb: typeof address?.suburb === 'string' ? address.suburb.trim() : '', city: typeof address?.city === 'string' ? address.city.trim() : '', postalCode: typeof address?.postalCode === 'string' ? address.postalCode.trim() : '', mapUrl }
    const deliveryPhone = typeof body.deliveryPhone === 'string' ? body.deliveryPhone.trim() : ''
    if (Object.values(deliveryAddress).some(value => !value) || deliveryPhone.length < 8) return NextResponse.json({ error: 'Enter your full delivery address and phone number before checking out.' }, { status: 400 })
    const ids = items.map(item => item.productId).join(',')
    const products = await adminRequest(`products?id=in.(${ids})&active=eq.true&select=id,supplier_id,name,retail_price_cents,stock_quantity,shipping_weight_grams,shipping_length_cm,shipping_width_cm,shipping_height_cm,bulky_surcharge_cents,delivery_override_cents`) as Product[]
    if (products.length !== items.length) throw new Error('One or more products are no longer available')
    const selected = items.map(item => ({ ...item, product: products.find(product => product.id === item.productId) }))
    if (selected.some(item => !item.product || item.quantity > (item.product.stock_quantity ?? Number.MAX_SAFE_INTEGER))) throw new Error('One or more products are unavailable')
    if (selected.some(item => !Number.isInteger(item.product!.retail_price_cents) || item.product!.retail_price_cents! <= 0)) throw new Error('One or more products do not have a confirmed price yet')
    const subtotal = selected.reduce((sum, item) => sum + item.product!.retail_price_cents! * item.quantity, 0)
    const deliveryFeeCents = deliveryFeeFromHighestPricedItem(selected.map(item => item.product!.retail_price_cents!))
    const total = subtotal + deliveryFeeCents
    const orderNumber = `CN-ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
    const [order] = await insertAdminRecord('orders', { order_number: orderNumber, status: 'pending_payment', currency: 'ZAR', total_cents: total, delivery_fee_cents: deliveryFeeCents, delivery_zone: 'national', customer_email: email, customer_id: user?.id || null, delivery_address: deliveryAddress, delivery_phone: deliveryPhone, delivery_status: 'paid_delivery' })
    await Promise.all(selected.map(item => insertAdminRecord('order_items', { order_id: order.id, product_id: item.product!.id, supplier_id: item.product!.supplier_id, product_name: item.product!.name, unit_price_cents: item.product!.retail_price_cents!, quantity: item.quantity })))
    const [payment] = await insertAdminRecord('payment_transactions', { order_id: order.id, amount_cents: total, state: 'pending' })
    const origin = new URL(request.url).origin
    const checkout = await createYocoCheckout({ amount: total, successUrl: `${origin}/api/payments/yoco/order-return?paymentId=${payment.id}`, cancelUrl: `${origin}/api/payments/yoco/order-cancel?paymentId=${payment.id}`, metadata: { paymentId: String(payment.id), orderId: String(order.id) } })
    await adminRequest(`payment_transactions?id=eq.${payment.id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ provider_payment_id: checkout.id }) })
    return NextResponse.json({ checkoutUrl: checkout.redirectUrl, paymentId: payment.id })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout could not be started.' }, { status: 500 }) }
}
