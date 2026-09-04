'use client'

import { useEffect, useMemo, useState } from 'react'

type Item = { productId: string; name: string; price: number; quantity: number }

const cartKey = 'connectnetwork_cart'

export function addToCart(item: Omit<Item, 'quantity'>) {
  const current: Item[] = JSON.parse(localStorage.getItem(cartKey) || '[]')
  const existing = current.find(entry => entry.productId === item.productId)
  if (existing) existing.quantity += 1
  else current.push({ ...item, quantity: 1 })
  localStorage.setItem(cartKey, JSON.stringify(current))
  window.dispatchEvent(new Event('cart-updated'))
}

export default function CartClient() {
  const [items, setItems] = useState<Item[]>([])
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  function loadCart() {
    setItems(JSON.parse(localStorage.getItem(cartKey) || '[]'))
  }

  function clearCart() {
    localStorage.removeItem(cartKey)
    setItems([])
    window.dispatchEvent(new Event('cart-updated'))
  }

  function removePaymentQuery() {
    window.history.replaceState({}, '', '/cart')
  }

  useEffect(() => {
    loadCart()
    window.addEventListener('cart-updated', loadCart)
    return () => window.removeEventListener('cart-updated', loadCart)
  }, [])

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search)
    const payment = parameters.get('payment')
    const paymentId = parameters.get('paymentId')
    let cancelled = false

    if (payment === 'success') {
      clearCart()
      setMessage('Payment confirmed. Thank you for your order.')
      removePaymentQuery()
      return
    }

    if (payment !== 'pending' || !paymentId) {
      if (payment === 'pending') setMessage('Your payment is being confirmed. Please refresh this page in a moment.')
      if (payment === 'cancelled') setMessage('Payment was cancelled. Your cart has been kept.')
      if (payment === 'verification_failed') setMessage('We could not verify the payment yet. Your cart has been kept safely.')
      return
    }

    setMessage('Confirming your payment…')
    let attempts = 0
    const confirmPayment = async () => {
      attempts += 1
      try {
        const response = await fetch(`/api/payments/yoco/order-status?paymentId=${encodeURIComponent(paymentId)}`, { cache: 'no-store' })
        const data = await response.json()
        if (data.status === 'succeeded') {
          if (!cancelled) {
            clearCart()
            setMessage('Payment confirmed. Thank you for your order.')
            removePaymentQuery()
          }
          return
        }
      } catch {}

      if (!cancelled && attempts < 12) window.setTimeout(confirmPayment, 2500)
      else if (!cancelled) setMessage('Your payment is still being confirmed. Your cart will stay safe until it is verified.')
    }

    void confirmPayment()
    return () => { cancelled = true }
  }, [])

  function update(productId: string, quantity: number) {
    const next = items
      .map(item => item.productId === productId ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0)
    localStorage.setItem(cartKey, JSON.stringify(next))
    setItems(next)
  }

  async function checkout() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setMessage('Enter your email address to receive order updates before checking out.')
      return
    }
    if (!items.length) return

    setCheckingOut(true)
    setMessage('Preparing secure checkout…')
    try {
      const response = await fetch('/api/payments/marketplace-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, items: items.map(item => ({ productId: item.productId, quantity: item.quantity })) }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) window.location.assign(data.checkoutUrl)
      else setMessage(data.error || 'Checkout could not be started.')
    } catch {
      setMessage('Checkout could not be started. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  return <main className="container-section py-16">
    <h1 className="section-title">Your cart</h1>
    {message && <p className="mt-4 rounded-lg bg-slate-100 p-4 text-sm text-slate-700" role="status">{message}</p>}
    {!items.length ? <p className="mt-4 text-slate-600">Your cart is empty. Add products from the Shop page to continue.</p> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="grid gap-4">
        {items.map(item => <article className="card flex items-center justify-between gap-4 p-5" key={item.productId}>
          <div><h2 className="font-bold">{item.name}</h2><p className="mt-1 text-primary">R{(item.price / 100).toFixed(2)}</p></div>
          <div className="flex items-center gap-3"><button onClick={() => update(item.productId, item.quantity - 1)} className="rounded border px-3 py-1" aria-label={`Remove one ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => update(item.productId, item.quantity + 1)} className="rounded border px-3 py-1" aria-label={`Add one ${item.name}`}>+</button></div>
        </article>)}
      </section>
      <aside className="card h-fit p-6">
        <h2 className="text-xl font-bold">Order summary</h2>
        <p className="mt-4 text-2xl font-bold">R{(total / 100).toFixed(2)}</p>
        <input value={email} onChange={event => setEmail(event.target.value)} className="mt-5 w-full rounded-lg border p-3" type="email" placeholder="Email for order updates" />
        <button onClick={checkout} disabled={checkingOut} className="btn btn-primary mt-4 w-full">{checkingOut ? 'Opening checkout…' : 'Secure checkout'}</button>
      </aside>
    </div>}
  </main>
}
