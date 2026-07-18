"use client"
import { motion } from 'framer-motion'

export default function CompensationClient(){
  return (
	<div className="grid md:grid-cols-3 gap-6 mt-10">
	  {[
		{t:'Refer one customer',d:'Introduce someone to our products.'},
		{t:'R50 Commission',d:'Earn R50 for each qualifying referral.'},
		{t:'Paid month-end',d:'Commissions are processed at month end.'},
	  ].map((c,i)=> (
		<motion.div key={c.t} className="card p-8 text-center hover:-translate-y-0.5 hover:shadow-lg transition" initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
		  <div className="text-2xl font-semibold">{c.t}</div>
		  <div className="text-gray-600 mt-2">{c.d}</div>
		</motion.div>
	  ))}
	</div>
  )
}
