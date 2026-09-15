export const minimumDeliveryFeeCents = 7500
export const deliveryZones = ['local', 'regional', 'national', 'remote'] as const

export type DeliveryZone = (typeof deliveryZones)[number]
export type ShippableProduct = {
  supplier_id: string
  shipping_weight_grams?: number | null
  shipping_length_cm?: number | null
  shipping_width_cm?: number | null
  shipping_height_cm?: number | null
  bulky_surcharge_cents?: number | null
  delivery_override_cents?: number | null
}
export type ShipmentItem = { product: ShippableProduct; quantity: number }

const baseFeeCents = 6500
const includedWeightKg = 2
const extraKgRateCents = 800
const zoneCharges: Record<DeliveryZone, number> = { local: 0, regional: 2500, national: 5000, remote: 9000 }

function positiveNumber(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

export function chargeableWeightKg(product: ShippableProduct) {
  const actualWeightKg = positiveNumber(product.shipping_weight_grams, 1000) / 1000
  const volumetricWeightKg = (positiveNumber(product.shipping_length_cm, 30) * positiveNumber(product.shipping_width_cm, 20) * positiveNumber(product.shipping_height_cm, 10)) / 5000
  return Math.max(actualWeightKg, volumetricWeightKg)
}

export function calculateShipmentDelivery(items: ShipmentItem[], zone: DeliveryZone = 'national') {
  if (!items.length) return 0
  const overrides = items.map(item => item.product.delivery_override_cents).filter((value): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0)
  if (overrides.length) return Math.max(...overrides)
  const chargeableWeight = items.reduce((total, item) => total + chargeableWeightKg(item.product) * item.quantity, 0)
  const weightCharge = Math.ceil(Math.max(0, chargeableWeight - includedWeightKg)) * extraKgRateCents
  const bulkySurcharge = items.reduce((total, item) => total + Math.max(0, Number(item.product.bulky_surcharge_cents) || 0) * item.quantity, 0)
  return Math.max(minimumDeliveryFeeCents, baseFeeCents + weightCharge + zoneCharges[zone] + bulkySurcharge)
}

export function calculateCartDelivery(items: ShipmentItem[], zone: DeliveryZone = 'national') {
  const shipments = new Map<string, ShipmentItem[]>()
  for (const item of items) shipments.set(item.product.supplier_id, [...(shipments.get(item.product.supplier_id) || []), item])
  return [...shipments.values()].reduce((total, shipment) => total + calculateShipmentDelivery(shipment, zone), 0)
}

export function deliveryFeeFromHighestPricedItem(pricesCents: number[]) {
  const highestPriceCents = Math.max(0, ...pricesCents.filter(price => Number.isInteger(price) && price > 0))
  return highestPriceCents ? Math.max(minimumDeliveryFeeCents, Math.round(highestPriceCents * 0.05)) : 0
}
