import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'

const MAX_SUPPLIERS = 5

type Enquiry = { id: string; requested_item: string; quantity_details: string; province: string; municipality: string }
type Supplier = { id: string; business_name: string; email?: string | null; phone?: string | null; website_url?: string | null; notes?: string | null }
type Membership = { supplier_id: string; ends_at: string }
type Candidate = { id?: string; supplier_id?: string | null; business_name: string; contact_details?: string | null; category?: string | null; province?: string | null; municipality?: string | null; delivery_capable?: boolean; source_type?: 'registered' | 'external'; priority_tier?: number; match_score?: number }

export type ExternalCandidateInput = { businessName: string; email: string; category?: string; province?: string; municipality?: string; deliveryCapable?: boolean; notes?: string }

function text(value: unknown) { return typeof value === 'string' ? value.trim() : '' }
function score(candidate: Supplier, enquiry: Enquiry) {
  const haystack = `${candidate.business_name} ${candidate.notes || ''} ${candidate.website_url || ''}`.toLowerCase()
  const terms = enquiry.requested_item.toLowerCase().match(/[a-z0-9]{3,}/g) || []
  return terms.reduce((total, term) => total + (haystack.includes(term) ? 20 : 0), 0)
}
function activeMembership(member: Membership) { return new Date(member.ends_at).getTime() >= Date.now() }
function emailFrom(candidate: Candidate) {
  const contact = candidate.contact_details || ''
  const match = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]?.toLowerCase() || ''
}
function supplierSafeText(value: string) {
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[redacted]').replace(/(?:\+?\d[\d\s()\-]{6,}\d)/g, '[redacted]')
}
function reference(enquiryId: string, candidateId: string) { return `CN-RFQ-${enquiryId.slice(0, 8).toUpperCase()}-${candidateId.slice(0, 4).toUpperCase()}` }

export async function createSourcingPlan(enquiryId: string, external: ExternalCandidateInput[] = []) {
  const [enquiry] = await adminRequest(`procurement_enquiries?id=eq.${encodeURIComponent(enquiryId)}&select=id,requested_item,quantity_details,province,municipality`)
  if (!enquiry) throw new Error('Enquiry was not found.')
  const request = enquiry as Enquiry
  const [suppliers, memberships, existing] = await Promise.all([
    adminRequest('suppliers?status=eq.approved&select=id,business_name,email,phone,website_url,notes'),
    adminRequest('supplier_membership_payments?select=supplier_id,ends_at'),
    adminRequest(`procurement_supplier_candidates?enquiry_id=eq.${encodeURIComponent(enquiryId)}&select=*`),
  ]) as [Supplier[], Membership[], Candidate[]]

  const paidIds = new Set(memberships.filter(activeMembership).map(member => member.supplier_id))
  const registered = suppliers
    .filter(supplier => paidIds.has(supplier.id))
    .map(supplier => ({ supplier, matchScore: score(supplier, request) }))
    .filter(row => row.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.supplier.business_name.localeCompare(b.supplier.business_name))

  const proposed: Candidate[] = registered.map(({ supplier, matchScore }) => ({
    supplier_id: supplier.id, business_name: supplier.business_name,
    contact_details: supplier.email || supplier.phone || null, source_type: 'registered', priority_tier: 1,
    match_score: matchScore, delivery_capable: true,
  }))
  for (const entry of external.slice(0, MAX_SUPPLIERS)) {
    const businessName = text(entry.businessName), email = text(entry.email).toLowerCase()
    if (!businessName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue
    const local = text(entry.municipality).toLowerCase() === request.municipality.toLowerCase()
    const provincial = text(entry.province).toLowerCase() === request.province.toLowerCase()
    proposed.push({ business_name: businessName, contact_details: email, category: text(entry.category) || null, province: text(entry.province) || null, municipality: text(entry.municipality) || null, source_type: 'external', priority_tier: local ? 3 : provincial ? 4 : 5, match_score: 0, delivery_capable: entry.deliveryCapable === true })
  }

  const selected = proposed.filter(row => Boolean(row.contact_details)).slice(0, MAX_SUPPLIERS)
  const created: Candidate[] = []
  for (const candidate of selected) {
    const found = existing.find(row => row.supplier_id && row.supplier_id === candidate.supplier_id) || existing.find(row => row.business_name.toLowerCase() === candidate.business_name.toLowerCase())
    if (found) { created.push(found); continue }
    const [row] = await insertAdminRecord('procurement_supplier_candidates', { enquiry_id: enquiryId, ...candidate, recruitment_status: candidate.source_type === 'registered' ? 'registered' : 'not_contacted' })
    created.push(row as Candidate)
  }

  const supplierSafeSnapshot = { item: supplierSafeText(request.requested_item), specifications_and_quantity: supplierSafeText(request.quantity_details), delivery_area: { province: request.province, municipality: request.municipality } }
  const queued: string[] = []
  for (const candidate of created.slice(0, MAX_SUPPLIERS)) {
    const recipientEmail = emailFrom(candidate)
    if (!candidate.id || !recipientEmail) continue
    const alreadyQueued = await adminRequest(`procurement_rfq_queue?enquiry_id=eq.${encodeURIComponent(enquiryId)}&candidate_id=eq.${encodeURIComponent(candidate.id)}&select=id`)
    if (alreadyQueued.length) continue
    await insertAdminRecord('procurement_rfq_queue', { enquiry_id: enquiryId, candidate_id: candidate.id, procurement_reference: reference(enquiryId, candidate.id), recipient_email: recipientEmail, requirements_snapshot: supplierSafeSnapshot })
    queued.push(candidate.id)
  }

  const noUsableSupplier = queued.length === 0
  if (noUsableSupplier) await insertAdminRecord('procurement_supply_gaps', { enquiry_id: enquiryId, requested_item: request.requested_item, province: request.province, municipality: request.municipality, reason: created.length ? 'no_delivery_capable_supplier' : 'no_relevant_supplier', evidence: { selected_suppliers: created.length, rfqs_queued: queued.length, external_candidates_considered: external.length } })
  await adminRequest(`procurement_enquiries?id=eq.${encodeURIComponent(enquiryId)}`, { method: 'PATCH', body: JSON.stringify({ status: queued.length ? 'sourcing' : 'closed' }) })
  return { selected: created.length, queued: queued.length, supplierGapRecorded: noUsableSupplier }
}

export async function sendQueuedRfq(queueId: string) {
  const [rfq] = await adminRequest(`procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}&status=eq.queued&select=*`)
  if (!rfq) throw new Error('Queued RFQ was not found or has already been processed.')
  const key = process.env.RESEND_API_KEY
  const from = process.env.RFQ_FROM_EMAIL || 'Connect Network <info@connectnetwork.co.za>'
  if (!key) throw new Error('RFQ email is not configured. Add RESEND_API_KEY before dispatching.')
  const requirement = rfq.requirements_snapshot as { item: string; specifications_and_quantity: string; delivery_area: { province: string; municipality: string } }
  const result = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [rfq.recipient_email], subject: `Request for quotation: ${rfq.procurement_reference}`, html: `<h1>Request for quotation</h1><p>Reference: <strong>${rfq.procurement_reference}</strong></p><p>Connect Network requests your pricing for the following requirement.</p><p><strong>Item/service:</strong> ${requirement.item}</p><p><strong>Specifications and quantity:</strong> ${requirement.specifications_and_quantity}</p><p><strong>Delivery area:</strong> ${requirement.delivery_area.municipality}, ${requirement.delivery_area.province}</p><p>Please reply with price, availability, delivery terms, VAT treatment and quotation validity.</p><p>Regards,<br/>Connect Network Procurement<br/>info@connectnetwork.co.za</p>` }) })
  if (!result.ok) { const failure = `Email provider returned ${result.status}`; await adminRequest(`procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'failed', failure_reason: failure }) }); throw new Error(failure) }
  const provider = await result.json() as { id?: string }
  await adminRequest(`procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'sent', sent_at: new Date().toISOString(), provider_message_id: provider.id || null }) })
  return { sent: true, reference: rfq.procurement_reference }
}
