import { NextResponse } from 'next/server'
import { hasControlApiAccess } from '@/lib/control-api'
import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'
import { sellingPriceFromCost } from '@/lib/supplier-listing'
import { requestDeliveryQuote, type DeliveryQuote } from '@/lib/delivery-quote'

const productCategories = ['Electronics', 'Home & Living', 'Fashion', 'Beauty & Personal Care', 'Health & Wellness', 'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Tools & Hardware', 'Office & Business', 'Food & Beverage', 'Other']

async function createManualProduct(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const supplierName = typeof body.supplierName === 'string' ? body.supplierName.trim() : ''
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : ''
  const supplierCostCents = Number(body.supplierCostCents)
  if (!name || !supplierName || !imageUrl || !Number.isInteger(supplierCostCents) || supplierCostCents <= 0) throw new Error('Name, supplier, image, and a supplier cost above zero are required.')
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const shippingWeightGrams = Number(body.shippingWeightGrams)
  const shippingLengthCm = Number(body.shippingLengthCm)
  const shippingWidthCm = Number(body.shippingWidthCm)
  const shippingHeightCm = Number(body.shippingHeightCm)
  const bulkySurchargeCents = Math.round(Number(body.bulkySurcharge) * 100)
  const deliveryOverrideCents = typeof body.deliveryOverride === 'string' && body.deliveryOverride.trim() !== '' ? Math.round(Number(body.deliveryOverride) * 100) : null
  if (![shippingWeightGrams, shippingLengthCm, shippingWidthCm, shippingHeightCm].every(value => Number.isFinite(value) && value > 0)) throw new Error('Enter a valid product weight and package dimensions.')
  if (!Number.isInteger(bulkySurchargeCents) || bulkySurchargeCents < 0 || (deliveryOverrideCents !== null && (!Number.isInteger(deliveryOverrideCents) || deliveryOverrideCents < 0))) throw new Error('Enter valid bulky and delivery override amounts.')
  const requestedCategory = typeof body.category === 'string' ? body.category.trim() : ''
  const category = productCategories.includes(requestedCategory) ? requestedCategory : 'Other'
  const supplierUrl = typeof body.supplierUrl === 'string' ? body.supplierUrl.trim() : ''
  if (!supplierUrl) throw new Error('Add the original supplier product URL for fulfilment records.')
  const [supplier] = await insertAdminRecord('suppliers', { channel: 'connected', status: 'approved', business_name: supplierName, contact_name: typeof body.supplierContact === 'string' ? body.supplierContact.trim() || null : null, phone: typeof body.supplierPhone === 'string' ? body.supplierPhone.trim() || null : null, website_url: supplierUrl || null, source_url: supplierUrl || null, reviewed_at: new Date().toISOString() })
  const retailPriceCents = sellingPriceFromCost(supplierCostCents)
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${crypto.randomUUID().slice(0, 6)}`
  await insertAdminRecord('products', { supplier_id: supplier.id, name, slug, description: description || null, category, image_url: imageUrl, supplier_cost_cents: supplierCostCents, retail_price_cents: retailPriceCents, shipping_weight_grams: Math.round(shippingWeightGrams), shipping_length_cm: shippingLengthCm, shipping_width_cm: shippingWidthCm, shipping_height_cm: shippingHeightCm, bulky_surcharge_cents: bulkySurchargeCents, delivery_override_cents: deliveryOverrideCents, active: true })
  return { retailPriceCents, category }
}

async function fulfilmentOrders() {
  const orders = await adminRequest('orders?status=in.(paid,processing)&select=id,status,total_cents,delivery_fee_cents,customer_email,delivery_address,delivery_phone,delivery_status,delivery_provider,delivery_quote_cents,created_at&order=created_at.asc') as Array<Record<string, unknown>>
  const orderIds = orders.map(order => String(order.id)).filter(Boolean)
  if (!orderIds.length) return []
  const items = await adminRequest(`order_items?order_id=in.(${orderIds.join(',')})&select=order_id,product_id,supplier_id,product_name,unit_price_cents,quantity,products(retail_price_cents,supplier_cost_cents,suppliers(business_name,source_url,website_url))`) as Array<Record<string, unknown>>
  let deliveries = await adminRequest(`supplier_deliveries?order_id=in.(${orderIds.join(',')})&select=id,order_id,supplier_id,status,internal_reference,supplier_reference,tracking_number,carrier,procurement_url,procurement_cost_cents,handling_notes,dispatched_at`) as Array<Record<string, unknown>>
  const existing = new Set(deliveries.map(delivery => `${delivery.order_id}:${delivery.supplier_id}`))
  const missing = items.filter(item => !existing.has(`${item.order_id}:${item.supplier_id}`))
  if (missing.length) {
    await Promise.all(missing.map(item => adminRequest('supplier_deliveries', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ order_id: item.order_id, supplier_id: item.supplier_id, product_id: item.product_id, status: 'awaiting_dispatch' }) })))
    deliveries = await adminRequest(`supplier_deliveries?order_id=in.(${orderIds.join(',')})&select=id,order_id,supplier_id,status,internal_reference,supplier_reference,tracking_number,carrier,procurement_url,procurement_cost_cents,handling_notes,dispatched_at`) as Array<Record<string, unknown>>
  }
  return orders.map(order => {
    const orderItems = items.filter(item => item.order_id === order.id)
    const orderDeliveries = deliveries.filter(delivery => delivery.order_id === order.id).map(delivery => {
      const product = orderItems.find(item => item.supplier_id === delivery.supplier_id)?.products as { supplier_cost_cents?: unknown } | undefined
      return { ...delivery, supplier_cost_cents: Number(product?.supplier_cost_cents) || null }
    })
    return { ...order, items: orderItems, deliveries: orderDeliveries }
  })
}

async function updateFulfilment(body: Record<string, unknown>) {
  const deliveryId = typeof body.deliveryId === 'string' ? body.deliveryId : ''
  if (!deliveryId) throw new Error('Select a delivery record first.')
  const [delivery] = await adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}&select=id,order_id`)
  if (!delivery) throw new Error('Delivery record was not found.')

  if (body.action === 'mark-ordered') {
    const procurementCostCents = Number(body.procurementCostCents)
    const supplierReference = typeof body.supplierReference === 'string' ? body.supplierReference.trim() : ''
    if (!supplierReference) throw new Error('Enter the supplier order reference before marking this order as placed.')
    if (!Number.isInteger(procurementCostCents) || procurementCostCents < 0) throw new Error('Enter the confirmed supplier cost before marking this order as placed.')
    const patch = { supplier_reference: supplierReference, procurement_url: typeof body.procurementUrl === 'string' ? body.procurementUrl.trim() || null : null, procurement_cost_cents: procurementCostCents, handling_notes: typeof body.notes === 'string' ? body.notes.trim() || null : null }
    await adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) })
    const [order] = await adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}&select=delivery_address`)
    const quote: DeliveryQuote = order?.delivery_address?.line1 && order?.delivery_address?.suburb && order?.delivery_address?.city && order?.delivery_address?.postalCode ? await requestDeliveryQuote(order.delivery_address).catch(() => ({ available: false })) : { available: false }
    await adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'processing', ...(quote.available ? { delivery_provider: quote.provider, delivery_quote_cents: quote.amountCents, delivery_status: 'awaiting_dispatch' } : {}) }) })
    return quote.available ? `Order marked as placed. Delivery quote: R${(quote.amountCents! / 100).toFixed(2)}.` : 'Order marked as placed. Delivery quote will be requested when a courier provider is connected.'
  }
  if (body.action === 'add-tracking') {
    const trackingNumber = typeof body.trackingNumber === 'string' ? body.trackingNumber.trim() : ''
    if (!trackingNumber) throw new Error('Enter a tracking number.')
    await adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ tracking_number: trackingNumber, carrier: typeof body.carrier === 'string' ? body.carrier.trim() || null : null, status: 'dispatched', dispatched_at: new Date().toISOString() }) })
    await adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'processing', delivery_status: 'dispatched' }) })
    return 'Tracking details saved and order marked as dispatched.'
  }
  if (body.action === 'cancel-order') {
    await Promise.all([
      adminRequest(`supplier_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'failed' }) }),
      adminRequest(`orders?id=eq.${encodeURIComponent(delivery.order_id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'cancelled', delivery_status: 'exception' }) }),
    ])
    await insertAdminRecord('ai_events', { event_type: 'refund_review_required', actor: 'admin', payload: { order_id: delivery.order_id, delivery_id: deliveryId } })
    return 'Order cancelled. A refund review has been recorded.'
  }
  throw new Error('Invalid fulfilment action.')
}

async function setManualDeliveryQuote(orderId: string, deliveryQuoteCents: unknown) {
  const amount = Number(deliveryQuoteCents)
  if (!orderId || !Number.isInteger(amount) || amount < 0) throw new Error('Enter a valid delivery amount.')
  await adminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ delivery_provider: 'Manual supplier/courier quote', delivery_quote_cents: amount, delivery_status: 'quoted' }) })
}

async function markOrderDelivered(orderId: string) {
  if (!orderId) throw new Error('Select an order first.')
  await Promise.all([
    adminRequest(`supplier_deliveries?order_id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'delivered', dispatched_at: new Date().toISOString() }) }),
    adminRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'fulfilled', delivery_status: 'delivered' }) }),
  ])
}

async function updateProduct(body: Record<string, unknown>) {
  const productId = typeof body.productId === 'string' ? body.productId : ''
  if (!productId) throw new Error('Select a product first.')
  const lifecycleStatus = ['active', 'paused', 'out_of_stock', 'archived'].includes(String(body.lifecycleStatus)) ? String(body.lifecycleStatus) : 'paused'
  const suppliedCost = Number(body.supplierCostCents)
  const hasSuppliedCost = Number.isInteger(suppliedCost) && suppliedCost >= 0
  const changes: Record<string, unknown> = { lifecycle_status: lifecycleStatus, active: lifecycleStatus === 'active' || lifecycleStatus === 'out_of_stock', updated_at: new Date().toISOString() }
  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (!name) throw new Error('Enter a product name.')
    changes.name = name
  }
  if (typeof body.description === 'string') changes.description = body.description.trim() || null
  if (typeof body.category === 'string') changes.category = productCategories.includes(body.category.trim()) ? body.category.trim() : 'Other'
  if (body.stockQuantity !== undefined) {
    const stockQuantity = Number(body.stockQuantity)
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) throw new Error('Enter a valid stock quantity.')
    changes.stock_quantity = stockQuantity
  }
  if (typeof body.imageUrl === 'string') {
    const imageUrl = body.imageUrl.trim()
    try { new URL(imageUrl) } catch { throw new Error('Enter a valid product image URL.') }
    changes.image_url = imageUrl
  }
  if (hasSuppliedCost) {
    changes.supplier_cost_cents = suppliedCost
    changes.retail_price_cents = sellingPriceFromCost(suppliedCost)
  }
  await adminRequest(`products?id=eq.${encodeURIComponent(productId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) })
  const supplierId = typeof body.supplierId === 'string' ? body.supplierId : ''
  if (supplierId && typeof body.supplierProductUrl === 'string') {
    const supplierProductUrl = body.supplierProductUrl.trim()
    if (!supplierProductUrl) throw new Error('Keep an original supplier product URL for fulfilment records.')
    try { new URL(supplierProductUrl) } catch { throw new Error('Enter a valid supplier product URL.') }
    const supplierChanges: Record<string, unknown> = { source_url: supplierProductUrl, website_url: supplierProductUrl }
    if (typeof body.supplierName === 'string' && body.supplierName.trim()) supplierChanges.business_name = body.supplierName.trim()
    await adminRequest(`suppliers?id=eq.${encodeURIComponent(supplierId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(supplierChanges) })
  }
}

async function archiveProductsWithoutCost() {
  const changes = { lifecycle_status: 'archived', active: false, updated_at: new Date().toISOString() }
  await Promise.all([
    adminRequest('products?supplier_cost_cents=is.null', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) }),
    adminRequest('products?supplier_cost_cents=lte.0', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) }),
  ])
}

async function permanentlyDeleteProduct(productId: string) {
  const [product] = await adminRequest(`products?id=eq.${encodeURIComponent(productId)}&select=id,lifecycle_status`)
  if (!product) throw new Error('Product was not found.')
  if (product.lifecycle_status !== 'archived') throw new Error('Archive this product before permanently deleting it.')
  const [orderItems, deliveries] = await Promise.all([
    adminRequest(`order_items?product_id=eq.${encodeURIComponent(productId)}&select=id&limit=1`),
    adminRequest(`supplier_deliveries?product_id=eq.${encodeURIComponent(productId)}&select=id&limit=1`),
  ])
  if (orderItems.length || deliveries.length) throw new Error('This product has order history and must remain archived to protect records.')
  await adminRequest(`products?id=eq.${encodeURIComponent(productId)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
}

export async function GET(request: Request) {
  if (!hasControlApiAccess(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  try {
    const [suppliers, promotions, payments, orders, products] = await Promise.all([
      adminRequest('suppliers?select=id'),
      adminRequest('promotions?select=id,status'),
      adminRequest('payment_transactions?select=id,state'),
      fulfilmentOrders(),
      adminRequest('products?select=id,name,description,category,image_url,retail_price_cents,supplier_cost_cents,stock_quantity,view_count,lifecycle_status,updated_at,supplier:suppliers(id,business_name,source_url,website_url)&order=updated_at.desc'),
    ])
    return NextResponse.json({ orders, products, metrics: { suppliers: suppliers.length, activePromotions: promotions.filter((promotion: Record<string, unknown>) => promotion.status === 'active').length, successfulPayments: payments.filter((payment: Record<string, unknown>) => payment.state === 'succeeded').length } })
  } catch { return NextResponse.json({ error: 'Control plane is not configured' }, { status: 503 }) }
}

export async function POST(request: Request) {
  if (!hasControlApiAccess(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  try {
    if (body.action === 'create-manual-product') return NextResponse.json({ ok: true, ...(await createManualProduct(body)) })
    if (body.action === 'update-product') { await updateProduct(body); return NextResponse.json({ ok: true }) }
    if (body.action === 'archive-products-without-cost') { await archiveProductsWithoutCost(); return NextResponse.json({ ok: true }) }
    if (body.action === 'permanently-delete-product' && typeof body.productId === 'string') { await permanentlyDeleteProduct(body.productId); return NextResponse.json({ ok: true }) }
    if (body.action === 'set-manual-delivery-quote' && typeof body.orderId === 'string') { await setManualDeliveryQuote(body.orderId, body.deliveryQuoteCents); return NextResponse.json({ ok: true, message: 'Delivery amount saved.' }) }
    if (body.action === 'mark-order-delivered' && typeof body.orderId === 'string') { await markOrderDelivered(body.orderId); return NextResponse.json({ ok: true, message: 'Order marked as delivered.' }) }
    if (['mark-ordered', 'add-tracking', 'cancel-order'].includes(String(body.action))) {
      return NextResponse.json({ ok: true, message: await updateFulfilment(body) })
    }
    return NextResponse.json({ error: 'Invalid control action' }, { status: 400 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Control action failed' }, { status:500 }) }
}
