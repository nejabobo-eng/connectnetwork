"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {q:'How does ConnectNetwork work?', a:'ConnectNetwork is a product distribution business. Every package purchased includes genuine products. Customers may choose to register as distributors and earn referral rewards when they introduce new customers who purchase qualifying product packages.'},
  {q:'What do I receive when I purchase a package?', a:'Every package includes the products described for that package. ConnectNetwork is committed to delivering the products purchased in accordance with our delivery policy.'},
  {q:'Is becoming a distributor compulsory?', a:'No. Anyone may purchase ConnectNetwork products without participating as a distributor. Becoming a distributor is entirely optional.'},
  {q:'How much is the Starter Pack?',a:'See our Product Packages for current pricing and inclusions.'},
  {q:'What is the distributor joining fee?',a:'R300 once-off, payable only if you choose to register as a distributor.'},
  {q:'How do referral rewards work?',a:'Referral rewards are paid in accordance with the current Distributor Rewards Plan after qualifying purchases are confirmed.'},
  {q:'How long does delivery take?',a:'Delivery times vary by location, especially for rural areas. All orders are tracked until fulfilled.'},
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
