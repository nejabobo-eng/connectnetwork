import { discoverDemand } from '@/lib/adde'
import { NextResponse } from 'next/server'
import { insertAdminRecord } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 10000) return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    const body = await request.json()

    if (body.action === 'supplier-registration') {
      const fields: Record<string, number> = { business_name: 150, business_type: 50, contact_name: 150, email: 254, phone: 30, province: 100, municipality: 150, locality: 150, service_areas: 1000, offering: 1000, product_categories: 500, capacity_notes: 1000, delivery_capable: 30, typical_lead_time: 150, vat_status: 30, rfq_email: 254 }
      const row: Record<string, string> = {}
      for (const [field, max] of Object.entries(fields)) {
        const value = body[field]
        if (typeof value !== 'string' || !value.trim() || value.trim().length > max) return NextResponse.json({ error: 'Please complete all supplier registration fields.' }, { status: 400 })
        row[field] = value.trim()
      }
      if (!['individual', 'registered_business'].includes(row.business_type) || !['yes', 'collection_only', 'case_by_case'].includes(row.delivery_capable) || !['registered', 'not_registered'].includes(row.vat_status)) return NextResponse.json({ error: 'Invalid supplier profile selection.' }, { status: 400 })
      await insertAdminRecord('supplier_applications', row)
      return NextResponse.json({ ok: true })
    }

    if (body.action === 'discover') {
      if (typeof body.item !== 'string' || body.item.length > 980 || !['Product', 'Service', 'Not sure'].includes(body.kind)) return NextResponse.json({ error: 'Invalid requirements' }, { status: 400 })
      if (/@|(?:\d[\s()+-]*){7,}/.test(body.item)) return NextResponse.json({ discovery: null })
      try { return NextResponse.json({ discovery: await discoverDemand(body.kind, body.item) }) } catch { return NextResponse.json({ discovery: null }) }
    }

    const fields: Record<string, number> = { customer_name: 150, phone: 30, email: 254, province: 100, municipality: 150, requested_item: 1000, quantity_details: 300, required_by: 10 }
    if (typeof body.required_by !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(body.required_by) || body.required_by < new Date().toISOString().slice(0, 10)) return NextResponse.json({ error: 'Enter a future required-by date.' }, { status: 400 })
    const row: Record<string, unknown> = { consent: true }
    if (body.consent !== true) return NextResponse.json({ error: 'Contact consent required' }, { status: 400 })
    for (const [field, max] of Object.entries(fields)) {
      const value = body[field]
      if (field === 'email' && !value) { row[field] = null; continue }
      if (typeof value !== 'string' || !value.trim() || value.length > max) return NextResponse.json({ error: 'Complete all required fields' }, { status: 400 })
      row[field] = value.trim()
    }
    await insertAdminRecord('procurement_enquiries', row)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not submit enquiry' }, { status: 400 })
  }
}
