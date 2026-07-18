"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactClient(){
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>){
	e.preventDefault()
	if (state === 'submitting') return
	setError(null)

	const form = e.currentTarget
	const data = new FormData(form)

	// basic client validation
	const name = String(data.get('name')||'').trim()
	const email = String(data.get('email')||'').trim()
	const message = String(data.get('message')||'').trim()
	if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message){
	  setError('Please fill in Name, a valid Email, and Message.');
	  return
	}

	setState('submitting')
	try {
		const res = await fetch('https://formspree.io/f/xnjepglb', {
		method: 'POST',
		headers: { 'Accept': 'application/json' },
		body: data,
	  })
	  const json = await res.json().catch(()=> ({}))
	  if (res.ok) {
		setState('success')
		form.reset()
	  } else {
		setState('error')
		setError(json?.error || 'Submission failed. Please try again.')
	  }
	} catch (err){
	  setState('error')
	  setError('Network error. Please try again.')
	}
  }

  return (
	<motion.form onSubmit={onSubmit} className="card p-6 space-y-4" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
	  <input className="border rounded-lg p-3 w-full" name="name" placeholder="Name" required aria-label="Name" autoComplete="name" />
	  <input className="border rounded-lg p-3 w-full" name="email" type="email" placeholder="Email" required aria-label="Email" autoComplete="email" />
	  <input className="border rounded-lg p-3 w-full" name="phone" placeholder="Phone" aria-label="Phone" autoComplete="tel" />
	  <input className="border rounded-lg p-3 w-full" name="subject" placeholder="Subject" aria-label="Subject" />
	  <textarea className="border rounded-lg p-3 w-full" name="message" placeholder="Message" rows={5} required aria-label="Message" />
	  <input type="hidden" name="_subject" value="New ConnectNetwork enquiry" />
	  <button className="btn btn-primary disabled:opacity-60" type="submit" aria-label="Send message" disabled={state==='submitting'}>
		{state==='submitting' ? 'Sending…' : 'Send'}
	  </button>
	  {state==='success' && <div className="text-green-600 text-sm" role="status">Thanks! Your message has been sent.</div>}
	  {state==='error' && <div className="text-red-600 text-sm" role="alert">{error}</div>}
	</motion.form>
  )
}
