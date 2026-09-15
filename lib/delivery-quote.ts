export type DeliveryAddress = { line1: string; suburb: string; city: string; postalCode: string; mapUrl?: string }
export type DeliveryQuote = { available: boolean; provider?: string; amountCents?: number; message?: string }

export async function requestDeliveryQuote(address: DeliveryAddress): Promise<DeliveryQuote> {
  const endpoint = process.env.DELIVERY_QUOTE_API_URL
  if (!endpoint) return { available: false, message: 'No delivery provider API is configured yet.' }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(process.env.DELIVERY_QUOTE_API_KEY ? { Authorization: `Bearer ${process.env.DELIVERY_QUOTE_API_KEY}` } : {}) },
    body: JSON.stringify({ delivery_address: address, map_url: address.mapUrl || null }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  })
  if (!response.ok) return { available: false, message: 'The delivery provider could not return a quote.' }
  const result = await response.json().catch(() => ({}))
  const amountCents = Number(result.amount_cents)
  return Number.isInteger(amountCents) && amountCents >= 0 ? { available: true, provider: typeof result.provider === 'string' ? result.provider : 'Courier', amountCents } : { available: false, message: 'The delivery provider returned an invalid quote.' }
}
