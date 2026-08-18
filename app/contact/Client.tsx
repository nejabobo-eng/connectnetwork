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
	<>
	  <motion.form onSubmit={onSubmit} className="card p-6 space-y-4" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		<input className="border rounded-lg p-3 w-full" name="name" placeholder="Your Name" required aria-label="Name" autoComplete="name" />
		<input className="border rounded-lg p-3 w-full" name="email" type="email" placeholder="Email" required aria-label="Email" autoComplete="email" />
		<input className="border rounded-lg p-3 w-full" name="business_name" placeholder="Business Name" aria-label="Business Name" />
		<input className="border rounded-lg p-3 w-full" name="phone" placeholder="Phone / WhatsApp" aria-label="Phone" autoComplete="tel" />
		<select className="border rounded-lg p-3 w-full" name="promote_what" aria-label="What do you want to promote?">
		  <option value="">What would you like to promote?</option>
		  <option value="business">My business</option>
		  <option value="product">A product</option>
		  <option value="service">A service</option>
		  <option value="offer">A special offer</option>
		  <option value="campaign">A campaign</option>
		  <option value="multiple">Multiple products/services</option>
		  <option value="other">Other</option>
		</select>
		<select className="border rounded-lg p-3 w-full" name="category" aria-label="Business Category">
		  <option value="">Select Business Category</option>
		  <option value="retail">Retail</option>
		  <option value="service">Service</option>
		  <option value="product">Product</option>
		  <option value="food">Food & Beverage</option>
		  <option value="tech">Technology</option>
		  <option value="professional">Professional Services</option>
		  <option value="other">Other</option>
		</select>
		<select className="border rounded-lg p-3 w-full" name="goals" aria-label="What would you like to achieve?">
		  <option value="">What would you like to achieve?</option>
		  <option value="awareness">Increase awareness</option>
		  <option value="promote_product">Promote a product</option>
		  <option value="promote_service">Promote a service</option>
		  <option value="enquiries">Generate customer enquiries</option>
		  <option value="offer">Promote a special offer</option>
		  <option value="other">Other</option>
		</select>
		<textarea className="border rounded-lg p-3 w-full" name="message" placeholder="Tell us about your business and what you want to promote" rows={5} required aria-label="Message" />
		<input type="hidden" name="_subject" value="Business Promotion Enquiry from ConnectNetwork" />
		<button className="btn btn-primary disabled:opacity-60" type="submit" aria-label="Request promotion info" disabled={state==='submitting'}>
		  {state==='submitting' ? 'Sending…' : 'Request Promotion Information'}
		</button>
		{state==='success' && <div className="text-green-600 text-sm" role="status">Thanks! We'll review your information and contact you to discuss promotion options.</div>}
		{state==='error' && <div className="text-red-600 text-sm" role="alert">{error}</div>}
	  </motion.form>

	  <motion.div className="card p-6 bg-gray-50 mt-8" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		<h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
		<div className="space-y-4 text-gray-700">
		  <div>
			<p className="font-semibold mb-1">Email</p>
			<a href="mailto:info@connectnetwork.co.za" className="text-primary hover:underline">info@connectnetwork.co.za</a>
		  </div>
		  <div>
			<p className="font-semibold mb-1">WhatsApp</p>
			<a href="https://wa.me/27745513626" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">+27 74 551 3626</a>
		  </div>
		  <div>
			<p className="font-semibold mb-1">Phone</p>
			<p>062 247 5462</p>
		  </div>
		</div>
	  </motion.div>
	</>
  )
}
