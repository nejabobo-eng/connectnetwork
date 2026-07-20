"use client"
import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = ['Buy Starter Pack','Receive Products','Use the Products','Recommend to Others','Earn Referral Commission']

export default function OpportunityClient(){
  return (
	<div>
	  <div className="card p-5 bg-green-50 border border-green-200 text-green-900">
		<div className="font-semibold">Distributor Registration Fee</div>
		<div className="text-sm">R300 once-off (applies only if you choose to register as a distributor).</div>
		<div className="text-xs mt-2 text-green-800">The once-off R300 distributor registration fee includes your selected Starter Package, registration as a ConnectNetwork distributor, and onboarding into the ConnectNetwork distribution programme.</div>
	  </div>

	  <ol className="relative border-l-2 border-primary/20 mt-10 pl-6 space-y-8">
		{steps.map((s,i)=> (
		  <motion.li key={s} className="group" initial={{x:-8,opacity:0}} whileInView={{x:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
			<div className="absolute -left-4 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">{i+1}</div>
			<div className="card p-5 hover:-translate-y-0.5 hover:shadow-lg transition">
			  <div className="font-semibold">{s}</div>
			</div>
		  </motion.li>
		))}
	  </ol>

	  <div className="card p-6 mt-10 text-sm text-gray-700">
		<div className="font-semibold mb-2">Important</div>
		<ul className="space-y-1">
		  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-secondary mt-0.5"/> Becoming a distributor is optional.</li>
		  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-secondary mt-0.5"/> Everyone can simply buy products.</li>
		  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-secondary mt-0.5"/> Distributor registration fee is R300 once-off when you choose to register.</li>
		  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-secondary mt-0.5"/> No pressure. No complicated structures.</li>
		</ul>
	  </div>
	</div>
  )
}
