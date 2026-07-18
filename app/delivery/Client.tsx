"use client"
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function DeliveryClient(){
  return (
	<div className="grid md:grid-cols-2 gap-8 mt-10 items-center">
	  <motion.div className="relative h-72" initial={{opacity:0,scale:0.98}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}>
		<Image src="/illustrations/distribution.svg" alt="Delivery" fill className="object-contain p-6 rounded-3xl" />
	  </motion.div>
	  <motion.ul className="space-y-3 text-gray-700" initial="hidden" whileInView="show" viewport={{once:true}} variants={{hidden:{},show:{transition:{staggerChildren:0.06}}}}>
		{[
		  'Delivery throughout South Africa.',
		  'Rural areas may receive scheduled deliveries or collection points.',
		  'Every order is tracked until fulfilled.',
		  'Customers are notified throughout the process.'
		].map((t)=> (
		  <motion.li key={t} variants={{hidden:{y:8,opacity:0},show:{y:0,opacity:1}}}>• {t}</motion.li>
		))}
	  </motion.ul>
	</div>
  )
}
