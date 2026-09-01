const apiUrl = 'https://payments.yoco.com/api/checkouts'

type Checkout = { id: string; redirectUrl: string; status: string }

function headers() {
  const key = process.env.YOCO_SECRET_KEY
  if (!key) throw new Error('YOCO_SECRET_KEY is not configured')
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
}

export async function createYocoCheckout(input: { amount: number; successUrl: string; cancelUrl: string; metadata: Record<string, string> }) {
  const response = await fetch(apiUrl, { method: 'POST', headers: { ...headers(), 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ amount: input.amount, currency: 'ZAR', successUrl: input.successUrl, cancelUrl: input.cancelUrl, metadata: input.metadata }), cache: 'no-store' })
  if (!response.ok) throw new Error(`Yoco checkout creation failed: ${response.status}`)
  return response.json() as Promise<Checkout>
}

export async function getYocoCheckout(checkoutId: string) {
  const response = await fetch(`${apiUrl}/${encodeURIComponent(checkoutId)}`, { headers: headers(), cache: 'no-store' })
  if (!response.ok) throw new Error(`Yoco checkout lookup failed: ${response.status}`)
  return response.json() as Promise<Checkout>
}
