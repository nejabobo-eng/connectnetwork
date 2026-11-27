import { NextResponse } from 'next/server'
import { insertAdminRecord } from '@/lib/supabase-admin'

const fields: Record<string, number> = {
  business_name: 150, business_type: 50, contact_name: 150, email: 254,
  phone: 30, province: 100, municipality: 150, locality: 150,
  service_areas: 1000, offering: 1000,
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const row: Record<string, string> = {}
    for (const [field, max] of Object.entries(fields)) {
      const value = body[field]
      if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
        return NextResponse.json({ error: 'Please complete all supplier registration fields.' }, { status: 400 })
      }
      row[field] = value.trim()
    }
    if (!['individual', 'registered_business'].includes(row.business_type)) {
      return NextResponse.json({ error: 'Invalid business type.' }, { status: 400 })
    }
    await insertAdminRecord('supplier_applications', row)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unable to submit application. Please try again.' }, { status: 400 })
  }
}
