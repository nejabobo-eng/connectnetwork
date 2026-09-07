'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Item = { productId: string; name: string; price: number; quantity: number }

const cartKey = 'connectnetwork_cart'
const pendingPaymentKey = 'connectnetwork_pending_payment'

export function addToCart(item: Omit<Item, 'quantity'>) {
  const current: Item[] = JSON.parse(localStorage.getItem(cartKey) || '[]')
  const existing = current.find(entry => entry.productId === item.productId)
  if (existing) existing.quantity += 1
  else current.push({ ...item, quantity: 1 })
  localStorage.setItem(cartKey, JSON.stringify(current))
  window.dispatchEvent(new Event('cart-updated'))
}

export default function CartClient({ email }: { email?: string | null }) {
  const [items, setItems] = useState<Item[]>([])
  const [message, setMessage] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  function loadCart() {
    setItems(JSON.parse(localStorage.getItem(cartKey) || '[]'))
  }

  function clearCart() {
    localStorage.removeItem(cartKey)
    localStorage.removeItem(pendingPaymentKey)
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
    const paymentId = parameters.get('paymentId') || localStorage.getItem(pendingPaymentKey)
    let cancelled = false

    if (payment === 'success') {
      clearCart()
      setMessage('Payment confirmed. Thank you for your order.')
      removePaymentQuery()
      return
    }

    if (!paymentId) {
      if (payment === 'pending') setMessage('Your payment is being confirmed. Please refresh this page in a moment.')
      if (payment === 'cancelled') setMessage('Payment was cancelled. Your cart has been kept.')
      if (payment === 'verification_failed') setMessage('We could not verify the payment yet. Your cart has been kept safely.')
      return
    }

    setMessage('Confirming your payment securely…')
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

      if (!cancelled && attempts < 12) {
        if (attempts === 3) setMessage('Your payment is taking a little longer to confirm. Please do not pay again.')
        window.setTimeout(confirmPayment, 2500)
      } else if (!cancelled) setMessage('We could not confirm your payment yet. Your cart is still safe and has not been charged again.')
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
    if (!email) {
      setMessage('Please sign in or create an account before checking out.')
      return
    }
    if (!items.length) return

    setCheckingOut(true)
    setMessage('Preparing secure checkout…')
    try {
      const response = await fetch('/api/payments/marketplace-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(item => ({ productId: item.productId, quantity: item.quantity })) }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && typeof data.checkoutUrl === 'string') {
        if (typeof data.paymentId === 'string') localStorage.setItem(pendingPaymentKey, data.paymentId)
        window.location.assign(data.checkoutUrl)
      }
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
        {email ? <><p className="mt-5 text-sm text-slate-600">Order updates: <strong>{email}</strong></p><button onClick={checkout} disabled={checkingOut} className="btn btn-primary mt-4 w-full">{checkingOut ? 'Opening checkout…' : 'Secure checkout'}</button></> : <><p className="mt-5 text-sm text-slate-600">Sign in to complete your purchase and receive order updates.</p><Link href="/account" className="btn btn-primary mt-4 w-full">Sign in to checkout</Link></>}
      </aside>
    </div>}
  </main>
}
