import { NextResponse } from 'next/server'
import { adminRequest } from '@/lib/supabase-admin'

export async function GET() {
  try {
    const products = await adminRequest('products?active=eq.true&lifecycle_status=in.(active,out_of_stock)&supplier_cost_cents=gt.0&retail_price_cents=gt.0&image_url=not.is.null&select=id,name,slug,description,category,image_url,retail_price_cents,sponsored,lifecycle_status&order=updated_at.desc')
    return NextResponse.json({ products: products.filter((product: { category?: string }) => ["Electronics","Computers & Laptops","Phones & Tablets","Computer & Mobile Accessories","Networking & Connectivity","TV & Audio","Gaming","Security & Smart Devices","Electronic Components","Chargers & Backup Power"].includes(product.category || '')) })
  } catch {
    return NextResponse.json({ products: [] })
  }
}
