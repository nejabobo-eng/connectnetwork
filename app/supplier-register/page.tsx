'use client'
import {useState,type FormEvent} from 'react'
import {createClient} from '@supabase/supabase-js'
export default function SupplierRegistration(){
const [busy,setBusy]=useState(false),[message,setMessage]=useState('')
async function submit(e:FormEvent<HTMLFormElement>){
e.preventDefault();const form=e.currentTarget;const data=new FormData(form);setBusy(true);setMessage('')
try{
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if(!url||!key)throw new Error('Registration is not configured.')
const fields=['business_name','business_type','contact_name','email','phone','province','municipality','locality','service_areas','offering']
const payload=Object.fromEntries(fields.map(k=>[k,String(data.get(k)||'').trim()]))
const {error}=await createClient(url,key).from('supplier_applications').insert(payload)
if(error)throw new Error('Unable to submit application. Please try again.')
form.reset();setMessage('Application received. Your business is pending review and is not yet approved to sell.')
}catch(err){setMessage(err instanceof Error?err.message:'Submission failed.')}finally{setBusy(false)}
}
return <main style={{maxWidth:680,margin:'auto',padding:24}}><a href="/">Connect Network</a><h1>Register as a supplier</h1><p>Supply your community and reach new customers.</p><p>Registration is free. Active supplier membership costs R100 per month, subject to verification and payment.</p><form onSubmit={submit} style={{display:'grid',gap:16}}>
<label>Business or trading name <input name="business_name" required minLength={2} maxLength={150}/></label>
<label>Business type <select name="business_type"><option value="individual">Individual / sole trader</option><option value="registered_business">Registered business</option></select></label>
<label>Contact person <input name="contact_name" required minLength={2} maxLength={150}/></label>
<label>Email <input name="email" type="email" required maxLength={254}/></label>
<label>Phone <input name="phone" type="tel" required minLength={7} maxLength={30}/></label>
<label>Province <select name="province">{['KwaZulu-Natal','Eastern Cape','Free State','Gauteng','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'].map(p=><option key={p}>{p}</option>)}</select></label>
<label>Municipality <input name="municipality" required minLength={2} maxLength={120}/></label>
<label>Town or locality <input name="locality" required minLength={2} maxLength={120}/></label>
<label>Areas you can supply (list municipalities and provinces) <textarea name="service_areas" required minLength={2} maxLength={1000}/></label>
<label>Products and services offered <textarea name="offering" required minLength={2} maxLength={1000}/></label>
<label><input type="checkbox" required/> I agree that Connect Network may use these details to review and contact me about my supplier application.</label>
<button disabled={busy} type="submit">{busy?'Submitting…':'Submit application'}</button><p role="status">{message}</p></form></main>
}
