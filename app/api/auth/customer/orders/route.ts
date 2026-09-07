import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-auth'
import { adminRequest } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    const email = user?.email?.toLowerCase()
    if (!email) return NextResponse.json({ error: 'Please sign in to view orders.' }, { status: 401 })
    const orders = await adminRequest(`orders?customer_email=eq.${encodeURIComponent(email)}&order=created_at.desc&select=id,status,total_cents,currency,delivery_status,created_at`)
    const orderIds = (orders as Array<{ id: string }>).map(order => order.id)
    const deliveries = orderIds.length ? await adminRequest(`supplier_deliveries?order_id=in.(${orderIds.join(',')})&select=order_id,status,tracking_number,carrier,dispatched_at,delivered_at`) : []
    return NextResponse.json({ orders, deliveries })
  } catch {
    return NextResponse.json({ error: 'Orders are not available yet.' }, { status: 503 })
  }
}
