import { NextResponse } from 'next/server'
import { adminRequest } from '@/lib/supabase-admin'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (!params.id) return NextResponse.json({ error: 'Product is required.' }, { status: 400 })
  try {
    await adminRequest('rpc/increment_product_views', { method: 'POST', body: JSON.stringify({ product_uuid: params.id }) })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
