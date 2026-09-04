import { NextResponse } from 'next/server'
import { adminRequest } from '@/lib/supabase-admin'

export async function GET() {
  try { return NextResponse.json({ products: await adminRequest('products?active=eq.true&select=id,name,slug,description,category,image_url,retail_price_cents,sponsored,supplier:suppliers(business_name)&order=created_at.desc') }) } catch { return NextResponse.json({ products: [] }) }
}
