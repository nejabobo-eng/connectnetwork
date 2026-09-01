'use client'
import { FormEvent, useState } from 'react'

export default function SupplierApplication() {
  const [message, setMessage] = useState<string>(); const [sending, setSending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setMessage(undefined)
    const response = await fetch('/api/suppliers/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) })
    setSending(false); setMessage(response.ok ? 'Application received. Our team will review it before anything is published.' : 'We could not submit your application right now. Please try again later.')
    if (response.ok) event.currentTarget.reset()
  }
  return <section className="container-section py-16 max-w-3xl"><p className="text-secondary font-semibold">Connected supplier portal</p><h1 className="section-title mt-2">List products with ConnectNetwork</h1><p className="section-subtitle mt-4">Send your business and catalogue details. Automation can prepare your catalogue, but a person approves suppliers and publishing.</p><form onSubmit={submit} className="card mt-8 p-6 grid gap-5"><Field name="businessName" label="Business name" required /><Field name="contactName" label="Contact name" /><Field name="email" type="email" label="Email address" required /><Field name="phone" label="Phone number" /><Field name="websiteUrl" type="url" label="Website" /><Field name="catalogueUrl" type="url" label="Catalogue link" /><label className="grid gap-1 text-sm font-medium">Anything we should know?<textarea name="notes" className="border rounded-lg p-3 font-normal" rows={4} /></label><button className="btn btn-primary justify-self-start" disabled={sending}>{sending ? 'Sending…' : 'Apply to become a supplier'}</button>{message && <p role="status" className="text-sm text-gray-600">{message}</p>}</form></section>
}
function Field({ name, label, type = 'text', required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="grid gap-1 text-sm font-medium">{label}<input name={name} type={type} required={required} className="border rounded-lg p-3 font-normal" /></label> }
