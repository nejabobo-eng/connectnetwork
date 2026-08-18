"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {q: 'What is ConnectNetwork?', a: 'ConnectNetwork is a business promotion and marketing service. We help businesses promote their businesses, products and services to a wider audience using our network, connections and marketing capabilities. Businesses pay us a monthly fee for promotion services.'},
  {q: 'What types of businesses can we promote?', a: 'We promote all types of businesses including startups, small businesses, service providers, product businesses, e-commerce stores, professional services, food & beverage, and established businesses. If you have a business or products to promote, we can help.'},
  {q: 'Can you promote individual products?', a: 'Yes. We promote products as well as businesses. Whether you\'re promoting a product line, a new launch, or special offers, we can create promotional content and share it through our channels.'},
  {q: 'Can startups use ConnectNetwork?', a: 'Absolutely. ConnectNetwork works with businesses of all stages, including startups. We offer affordable monthly promotion packages designed for startups, small businesses and established companies.'},
  {q: 'How does the monthly promotion service work?', a: 'You provide us with information about your business, products or services. Our team prepares promotional content suited to your business. We then promote your business through our website, social media, WhatsApp network, marketing campaigns and advertising channels. When customers are interested, they contact you directly.'},
  {q: 'Where will my business be promoted?', a: 'Your business is promoted through multiple channels: our website, social media platforms, WhatsApp network and targeted marketing campaigns. Radio advertising is available for selected campaigns and packages.'},
  {q: 'Do you offer radio advertising?', a: 'Radio advertising may be available for selected promotional campaigns and packages. Not all packages include radio, but it can be part of enhanced or premium promotion options. Contact us to discuss your specific needs.'},
  {q: 'How much does promotion cost?', a: 'ConnectNetwork offers affordable monthly promotion packages. Packages are flexible and designed for businesses of all sizes. Pricing varies based on the type and extent of promotion you need. Contact us to discuss current package options and pricing for your business.'},
  {q: 'How do customers contact my business?', a: 'When customers see your business promoted through ConnectNetwork, they can contact you directly via email, phone, WhatsApp or website if provided. You control how customers reach your business, and you handle all customer relationships and sales directly.'},
  {q: 'Does ConnectNetwork sell or fulfill my products?', a: 'No. ConnectNetwork promotes your business. You remain fully responsible for your products, services, pricing, customer relationships, order fulfillment and delivery. ConnectNetwork handles the promotion; you operate your business independently.'},
  {q: 'How do I request promotion?', a: 'Contact us through our website contact form or reach out directly via email (info@connectnetwork.co.za) or WhatsApp (+27 74 551 3626). Tell us about your business and what you\'d like to promote. We\'ll discuss options and pricing with you.'},
  {q: 'Is there a contract lock-in?', a: 'We don\'t provide legal or contractual details on the website. Contact us directly to discuss terms, commitments and payment arrangements for your specific promotion package.'},
]

export default function FAQClient(){
  return (
	<div className="mt-8 space-y-4">
	  {faqs.map((f)=> <Accordion key={f.q} q={f.q} a={f.a} />)}
	</div>
  )
}

function Accordion({q,a}:{q:string,a:string}){
  const [open,setOpen] = useState(false)
  return (
	<div className="card" role="region" aria-labelledby={q}>
	  <button aria-expanded={open} aria-controls={`${q}-panel`} id={q} className="w-full text-left p-5 font-medium flex justify-between items-center hover:bg-gray-50" onClick={()=>setOpen(o=>!o)}>
		{q}
		<span className="text-gray-400">{open ? '–' : '+'}</span>
	  </button>
	  <AnimatePresence initial={false}>
		{open && (
		  <motion.div id={`${q}-panel`} initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="px-5 pb-5 text-gray-700 overflow-hidden border-t">
			{a}
		  </motion.div>
		)}
	  </AnimatePresence>
	</div>
  )
}
