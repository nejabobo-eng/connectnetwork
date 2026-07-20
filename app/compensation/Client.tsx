"use client"
import { motion } from 'framer-motion'

export default function CompensationClient(){
  return (
	<div className="grid md:grid-cols-3 gap-6 mt-10">
	  {[
		{t:'Referral rewards',d:'ConnectNetwork rewards distributors who introduce new customers to our products.'},
		{t:'Compensation Plan',d:'Referral commissions are paid in accordance with the current Compensation Plan.'},
		{t:'By package purchased',d:'The applicable commission depends on the product package purchased by the referred customer.'},
	  ].map((c,i)=> (
		<motion.div key={c.t} className="card p-8 text-center hover:-translate-y-0.5 hover:shadow-lg transition" initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
		  <div className="text-2xl font-semibold">{c.t}</div>
		  <div className="text-gray-600 mt-2">{c.d}</div>
		</motion.div>
	  ))}
	</div>
  )
}
