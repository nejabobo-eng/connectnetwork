type OrderConfirmation = { orderId: string; email: string; totalCents: number; itemNames: string[] }

export async function sendOrderConfirmation({ orderId, email, totalCents, itemNames }: OrderConfirmation) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!key || !from) return { sent: false, reason: 'Email provider is not configured' }

  const reference = orderId.slice(0, 8).toUpperCase()
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `ConnectNetwork order ${reference} confirmed`,
      html: `<h1>Payment confirmed</h1><p>Thank you for your order <strong>${reference}</strong>.</p><p><strong>Items:</strong> ${itemNames.join(', ')}</p><p><strong>Total paid:</strong> R${(totalCents / 100).toFixed(2)}</p><p>We will send your tracking details as soon as your supplier dispatches your order.</p>`,
    }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Order email failed: ${response.status}`)
  return { sent: true, message: await response.json() as { id?: string } }
}
