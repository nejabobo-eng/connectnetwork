import { NextResponse } from 'next/server'
import { hasControlApiAccess } from '@/lib/control-api'

export async function POST(request: Request) {
  if (!hasControlApiAccess(request)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'Database storage is not configured.' }, { status: 503 })
  const form = await request.formData()
  const file = form.get('image')
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Upload an image smaller than 5 MB.' }, { status: 400 })
  const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg'
  const path = `manual/${crypto.randomUUID()}.${extension}`
  const upload = await fetch(`${url}/storage/v1/object/product-images/${path}`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': file.type, 'x-upsert': 'false' }, body: file })
  if (!upload.ok) return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 })
  return NextResponse.json({ imageUrl: `${url}/storage/v1/object/public/product-images/${path}` })
}
