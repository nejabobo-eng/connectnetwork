"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {q:'How much is the Starter Pack?',a:'R300. It includes cleaning products, optional distributor registration, access to the referral programme and product support.'},
  {q:'How do I become a distributor?',a:'Simply contact us after purchasing the Starter Pack and we will guide you through the optional distributor registration.'},
  {q:'How do commissions work?',a:'Refer a customer and earn R50 commission for each qualifying referral. Commissions are processed at month end.'},
  {q:'How long does delivery take?',a:'Delivery times vary by location, especially for rural areas. All orders are tracked until fulfilled.'},
  {q:'Do I have to recruit people?',a:'No. You can simply buy and use the products. Distribution is optional for those who want to earn referral income.'},
  {q:'Can I simply buy products?',a:'Yes. Anyone can purchase products without becoming a distributor.'},
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
	  <button aria-expanded={open} aria-controls={`${q}-panel`} id={q} className="w-full text-left p-5 font-medium flex justify-between items-center" onClick={()=>setOpen(o=>!o)}>
		{q}
		<span className="text-gray-400">{open ? '–' : '+'}</span>
	  </button>
	  <AnimatePresence initial={false}>
		{open && (
		  <motion.div id={`${q}-panel`} initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="px-5 pb-5 text-gray-700 overflow-hidden">
			{a}
		  </motion.div>
		)}
	  </AnimatePresence>
	</div>
  )
}
