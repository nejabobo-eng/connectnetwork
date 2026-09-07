'use client'

import { useEffect, useState } from 'react'

type Order = { id: string; status: string; total_cents: number; currency: string; delivery_status?: string; created_at: string }
type Delivery = { order_id: string; status: string; tracking_number?: string; carrier?: string; dispatched_at?: string; delivered_at?: string }

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [message, setMessage] = useState('Loading your orders…')

  useEffect(() => {
    fetch('/api/auth/customer/orders', { cache: 'no-store' }).then(async response => {
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Orders could not be loaded.')
      setOrders(data.orders || [])
      setDeliveries(data.deliveries || [])
      setMessage('')
    }).catch(error => setMessage(error instanceof Error ? error.message : 'Orders could not be loaded.'))
  }, [])

  return <section className="mt-8 border-t pt-7"><h2 className="text-lg font-bold">My orders</h2>{message && <p className="mt-3 text-sm text-slate-600">{message}</p>}{!message && !orders.length && <p className="mt-3 text-sm text-slate-600">You have not placed an order yet.</p>}<div className="mt-4 grid gap-3">{orders.map(order => { const orderDeliveries = deliveries.filter(delivery => delivery.order_id === order.id); return <article key={order.id} className="rounded-xl border p-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>Order {order.id.slice(0, 8).toUpperCase()}</strong><span className="font-semibold text-primary">{order.status.replace('_', ' ')}</span></div><p className="mt-2">R{(order.total_cents / 100).toFixed(2)} · {new Date(order.created_at).toLocaleDateString('en-ZA')}</p>{orderDeliveries.length ? orderDeliveries.map((delivery, index) => <p key={index} className="mt-2 text-slate-600">Delivery: {delivery.status.replace('_', ' ')}{delivery.tracking_number ? ` · ${delivery.carrier || 'Courier'} tracking ${delivery.tracking_number}` : ''}</p>) : <p className="mt-2 text-slate-600">Delivery: preparing fulfilment</p>}</article> })}</div></section>
}
