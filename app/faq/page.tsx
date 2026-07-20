import FAQClient from './Client'
export const metadata = { title: 'FAQ — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/faq' } } as const
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

export default function FAQPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title">Frequently Asked Questions</h1>
	  <FAQClient />

	  <div className="card p-6 mt-8 text-sm text-gray-700">
		<div className="font-semibold">Important</div>
		<p className="mt-2">ConnectNetwork is a product distribution company. Purchasing a product package is primarily for the value of the products received. Participation in the distributor programme is optional and referral commissions are paid only in accordance with the current ConnectNetwork Compensation Plan after qualifying purchases have been confirmed.</p>
	  </div>
	</div>
  )
}
