'use client'
import { useState, type FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DemandPage() {
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form=e.currentTarget
    const data=new FormData(form)
    setBusy(true); setMessage('')
    try {
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL
      const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) throw new Error('DemandFirst is not configured.')
      const client=createClient(url,key)
      const {data:auth,error:authError}=await client.auth.getUser()
      if(authError || !auth.user) throw new Error('Please sign in before submitting a request.')
      const budget=String(data.get('budget')||'').trim()
      const quantity=Number(data.get('quantity'))
      const cents=budget===''?null:Math.round(Number(budget)*100)
      if(!Number.isSafeInteger(quantity)||quantity<1||quantity>2147483647|| (cents!==null&&(!Number.isSafeInteger(cents)||cents<0))) throw new Error('Enter a valid quantity and budget.')
      const {error}=await client.from('demand_requests').insert({
        kind:data.get('kind'),title:String(data.get('title')).trim(),category:String(data.get('category')).trim(),
        province:String(data.get('province')).trim(),municipality:String(data.get('municipality')).trim(),
        quantity,unit:String(data.get('unit')).trim(),unit_budget_cents:cents,
        frequency:data.get('frequency'),required_by:data.get('required_by')||null,intent:data.get('intent')
      })
      if(error) throw new Error('Unable to save your request. Please check your details and try again.')
      form.reset();setMessage('Your demand request has been submitted. It is not a confirmed order.')
    } catch(error){setMessage(error instanceof Error?error.message:'Submission failed.')}
    finally{setBusy(false)}
  }
  return <main style={{maxWidth:640,margin:'40px auto',padding:24}}>
    <h1>DemandFirst</h1><p>Tell us what you need. Your request helps identify real market opportunities.</p>
    <form onSubmit={submit} style={{display:'grid',gap:16}}>
      <label>Type <select name="kind"><option value="product">Product</option><option value="service">Service</option></select></label>
      <label>What do you need? <input name="title" required minLength={2} maxLength={200}/></label>
      <label>Category <input name="category" required minLength={2} maxLength={100}/></label>
      <label>Province <select name="province" required>{['KwaZulu-Natal','Eastern Cape','Free State','Gauteng','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(p=><option key={p}>{p}</option>)}</select></label>
      <label>Municipality <input name="municipality" required maxLength={120}/></label>
      <label>Quantity <input name="quantity" type="number" min="1" max="2147483647" step="1" required/></label>
      <label>Unit (e.g. kg, items, hours) <input name="unit" required maxLength={60}/></label>
      <label>Budget per unit (R, optional) <input name="budget" type="number" min="0" step="0.01"/></label>
      <label>Frequency <select name="frequency"><option value="once">Once-off</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="annual">Annually</option></select></label>
      <label>Required by (optional) <input name="required_by" type="date"/></label>
      <label>Purchase intention <select name="intent"><option value="interest">Exploring options</option><option value="purchase_intention">Intend to purchase</option></select></label>
      <p>Submitting is not an order or payment commitment. Requests may be used in aggregated market research.</p>
      <button disabled={busy} type="submit">{busy?'Submitting…':'Submit request'}</button>
      <p role="status">{message}</p>
    </form>
  </main>
}
