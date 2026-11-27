import { adminRequest, insertAdminRecord } from '@/lib/supabase-admin'

const MAX_SUPPLIERS = 5

type Enquiry = {
  id: string
  requested_item: string
  quantity_details: string
  province: string
  municipality: string
  locality?: string | null
  required_by?: string | null
  email: string
}
type SupplierApplication = {
  id: string
  business_name: string
  email?: string | null
  rfq_email?: string | null
  offering?: string | null
  product_categories?: string | null
  capacity_notes?: string | null
  province?: string | null
  municipality?: string | null
  locality?: string | null
  delivery_capable?: 'yes' | 'collection_only' | 'case_by_case' | null
  supply_type?: 'goods' | 'services' | 'both' | null
}
type Candidate = {
  id?: string
  supplier_id?: string | null
  business_name: string
  contact_details?: string | null
  category?: string | null
  province?: string | null
  municipality?: string | null
  delivery_capable?: boolean
  source_type?: 'registered' | 'external'
  priority_tier?: number
  match_score?: number
}

export type ExternalCandidateInput = {
  businessName: string
  email: string
  category?: string
  province?: string
  municipality?: string
  deliveryCapable?: boolean
  notes?: string
}

function text(value: unknown) { return typeof value === 'string' ? value.trim() : '' }
function score(supplier: SupplierApplication, enquiry: Enquiry) {
  const haystack = [
    supplier.business_name, supplier.offering, supplier.product_categories,
    supplier.capacity_notes, supplier.supply_type,
  ].filter(Boolean).join(' ').toLowerCase()
  const terms = enquiry.requested_item.toLowerCase().match(/[a-z0-9]{3,}/g) || []
  return terms.reduce((total, term) => total + (haystack.includes(term) ? 20 : 0), 0)
}
function priority(supplier: SupplierApplication, enquiry: Enquiry) {
  const municipality = text(supplier.municipality).toLowerCase()
  const province = text(supplier.province).toLowerCase()
  if (municipality && municipality === enquiry.municipality.toLowerCase()) return 1
  if (province && province === enquiry.province.toLowerCase()) return 2
  return 3
}
function emailFrom(candidate: Candidate) {
  const contact = candidate.contact_details || ''
  const match = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0]?.toLowerCase() || ''
}
function supplierSafeText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig, '[redacted]')
    .replace(/(?:\+?\d[\d\s()\-]{6,}\d)/g, '[redacted]')
}
function reference(enquiryId: string, candidateId: string) {
  return `CN-RFQ-${enquiryId.slice(0, 8).toUpperCase()}-${candidateId.slice(0, 4).toUpperCase()}`
}
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character] || character))
}

export async function createSourcingPlan(enquiryId: string, external: ExternalCandidateInput[] = []) {
  const [enquiry] = await adminRequest(
    `procurement_enquiries?id=eq.${encodeURIComponent(enquiryId)}&select=id,requested_item,quantity_details,province,municipality,locality,required_by,email`,
  )
  if (!enquiry) throw new Error('Enquiry was not found.')
  const request = enquiry as Enquiry
  const [registeredApplications, existing] = await Promise.all([
    adminRequest('supplier_applications?status=eq.approved&select=id,business_name,email,rfq_email,offering,product_categories,capacity_notes,province,municipality,locality,delivery_capable,supply_type'),
    adminRequest(`procurement_supplier_candidates?enquiry_id=eq.${encodeURIComponent(enquiryId)}&select=*),
  ]) as [SupplierApplication[], Candidate[]]

  const registered = registeredApplications
    .filter(supplier => supplier.delivery_capable !== 'collection_only')
    .map(supplier => ({ supplier, matchScore: score(supplier, request) }))
    .filter(row => row.matchScore > 0)
    .sort((a, b) =>
      priority(a.supplier, request) - priority(b.supplier, request) ||
      b.matchScore - a.matchScore ||
      a.supplier.business_name.localeCompare(b.supplier.business_name),
    )

  const proposed: Candidate[] = registered.map(({ supplier, matchScore }) => ({
    supplier_id: supplier.id,
    business_name: supplier.business_name,
    contact_details: supplier.rfq_email || supplier.email || null,
    category: supplier.product_categories || null,
    province: supplier.province || null,
    municipality: supplier.municipality || null,
    source_type: 'registered',
    priority_tier: priority(supplier, request),
    match_score: matchScore,
    delivery_capable: supplier.delivery_capable === 'yes' || supplier.delivery_capable === 'case_by_case',
  }))

  for (const entry of external.slice(0, MAX_SUPPLIERS)) {
    const businessName = text(entry.businessName)
    const email = text(entry.email).toLowerCase()
    if (!businessName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue
    const local = text(entry.municipality).toLowerCase() === request.municipality.toLowerCase()
    const provincial = text(entry.province).toLowerCase() === request.province.toLowerCase()
    proposed.push({
      business_name: businessName, contact_details: email, category: text(entry.category) || null,
      province: text(entry.province) || null, municipality: text(entry.municipality) || null,
      source_type: 'external', priority_tier: local ? 4 : provincial ? 5 : 6,
      match_score: 0, delivery_capable: entry.deliveryCapable === true,
    })
  }

  const selected = proposed.filter(row => Boolean(row.contact_details)).slice(0, MAX_SUPPLIERS)
  const created: Candidate[] = []
  for (const candidate of selected) {
    const found = existing.find(row => row.supplier_id && row.supplier_id === candidate.supplier_id) ||
      existing.find(row => row.business_name.toLowerCase() === candidate.business_name.toLowerCase())
    if (found) {
      created.push(found)
      continue
    }
    const [row] = await insertAdminRecord('procurement_supplier_candidates', {
      enquiry_id: enquiryId, ...candidate,
      recruitment_status: candidate.source_type === 'registered' ? 'registered' : 'not_contacted',
    })
    created.push(row as Candidate)
  }

  const supplierSafeSnapshot = {
    item: supplierSafeText(request.requested_item),
    specifications_and_quantity: supplierSafeText(request.quantity_details),
    delivery_area: {
      province: request.province,
      municipality: request.municipality,
      locality: request.locality || null,
    },
    required_by: request.required_by || null,
    customer_email: request.email,
  }
  const queued: string[] = []
  for (const candidate of created.slice(0, MAX_SUPPLIERS)) {
    const recipientEmail = emailFrom(candidate)
    if (!candidate.id || !recipientEmail) continue
    const alreadyQueued = await adminRequest(
      `procurement_rfq_queue?enquiry_id=eq.${encodeURIComponent(enquiryId)}&candidate_id=eq.${encodeURIComponent(candidate.id)}&select=id`,
    )
    if (alreadyQueued.length) continue
    await insertAdminRecord('procurement_rfq_queue', {
      enquiry_id: enquiryId, candidate_id: candidate.id,
      procurement_reference: reference(enquiryId, candidate.id),
      recipient_email: recipientEmail,
      requirements_snapshot: supplierSafeSnapshot,
    })
    queued.push(candidate.id)
  }

  const noUsableSupplier = queued.length === 0
  if (noUsableSupplier) {
    await insertAdminRecord('procurement_supply_gaps', {
      enquiry_id: enquiryId, requested_item: request.requested_item,
      province: request.province, municipality: request.municipality,
      reason: created.length ? 'no_delivery_capable_supplier' : 'no_relevant_supplier',
      evidence: {
        selected_suppliers: created.length, rfqs_queued: queued.length,
        external_candidates_considered: external.length,
      },
    })
  }
  await adminRequest(`procurement_enquiries?id=eq.${encodeURIComponent(enquiryId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: queued.length ? 'sourcing' : 'closed' }),
  })
  return { selected: created.length, queued: queued.length, supplierGapRecorded: noUsableSupplier }
}

export async function sendQueuedRfq(queueId: string) {
  const [rfq] = await adminRequest(
    `procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}&status=eq.queued&select=*),
  )
  if (!rfq) throw new Error('Queued RFQ was not found or has already been processed.')
  const key = process.env.RESEND_API_KEY
  const from = process.env.RFQ_FROM_EMAIL || 'Connect Network <info@connectnetwork.co.za>'
  if (!key) throw new Error('RFQ email is not configured. Add RESEND_API_KEY before dispatching.')

  const requirement = rfq.requirements_snapshot as {
    item: string
    specifications_and_quantity: string
    delivery_area: { province: string; municipality: string; locality?: string | null }
    required_by?: string | null
    customer_email: string
  }
  const locality = requirement.delivery_area.locality ? `, ${requirement.delivery_area.locality}` : ''
  const requiredBy = requirement.required_by ? `<p><strong>Required by:</strong> ${escapeHtml(requirement.required_by)}</p>` : ''
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [rfq.recipient_email],
      subject: `Request for quotation: ${rfq.procurement_reference}`,
      html: `<h1>Request for quotation</h1><p>Reference: <strong>${escapeHtml(rfq.procurement_reference)}</strong></p><p>Connect Network requests your pricing for the following requirement.</p><p><strong>Item/service:</strong> ${escapeHtml(requirement.item)}</p><p><strong>Specifications and quantity:</strong> ${escapeHtml(requirement.specifications_and_quantity)}</p><p><strong>Delivery area:</strong> ${escapeHtml(requirement.delivery_area.municipality)}${escapeHtml(locality)}, ${escapeHtml(requirement.delivery_area.province)}</p>${requiredBy}<p><strong>Customer email for quotations:</strong> <a href="mailto:${escapeHtml(requirement.customer_email)}">${escapeHtml(requirement.customer_email)}</a></p><p>Please reply directly to the customer with your price, availability, delivery terms, VAT treatment and quotation validity.</p><p>Regards,<br/>Connect Network Procurement<br/>info@connectnetwork.co.za</p>`,
    }),
  })
  if (!result.ok) {
    const failure = `Email provider returned ${result.status}`
    await adminRequest(`procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}`, {
      method: 'PATCH', body: JSON.stringify({ status: 'failed', failure_reason: failure }),
    })
    throw new Error(failure)
  }
  const provider = await result.json() as { id?: string }
  await adminRequest(`procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'sent', sent_at: new Date().toISOString(),
      provider_message_id: provider.id || null,
    }),
  })
  return { sent: true, reference: rfq.procurement_reference }
}
