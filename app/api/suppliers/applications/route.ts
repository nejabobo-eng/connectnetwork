import { NextResponse } from 'next/server'
import { hasDatabaseConfiguration, insertAdminRecord } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  if (!hasDatabaseConfiguration()) return NextResponse.json({ error: 'Supplier intake is not configured yet.' }, { status: 503 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.businessName !== 'string' || typeof body.email !== 'string') return NextResponse.json({ error: 'Business name and email are required.' }, { status: 400 })
  try {
    const [supplier] = await insertAdminRecord('suppliers', { channel: 'connected', status: 'pending_review', business_name: body.businessName.trim(), contact_name: String(body.contactName || '').trim() || null, email: body.email.trim().toLowerCase(), phone: String(body.phone || '').trim() || null, website_url: String(body.websiteUrl || '').trim() || null, catalogue_url: String(body.catalogueUrl || '').trim() || null, notes: String(body.notes || '').trim().slice(0, 4000) || null })
    await insertAdminRecord('ai_events', { event_type: 'connected_supplier_application_received', actor: 'supplier_portal', payload: { supplier_id: supplier.id } })
    await insertAdminRecord('ai_tasks', { task_type: 'supplier_catalogue_intake', payload: { supplier_id: supplier.id } })
    return NextResponse.json({ id: supplier.id, status: 'pending_review' }, { status: 201 })
  } catch { return NextResponse.json({ error: 'We could not receive your application. Please try again.' }, { status: 500 }) }
}
