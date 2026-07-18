"use client"
import { ShieldCheck, Leaf, Users, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function WhyClient(){
  const points = [
	{icon:<ShieldCheck className="h-6 w-6 text-primary"/>,h:'Why was ConnectNetwork created?',t:'To connect South African households with dependable, everyday products through a trusted distribution network.'},
	{icon:<Leaf className="h-6 w-6 text-primary"/>,h:'Why cleaning products?',t:'They are used daily, have consistent demand, and offer clear, demonstrable value.'},
	{icon:<Users className="h-6 w-6 text-primary"/>,h:'Why distributors?',t:'People buy from people they trust. Our community of independent distributors provides service and support.'},
	{icon:<Sparkles className="h-6 w-6 text-primary"/>,h:'What makes us different?',t:'Product-first approach with a simple, transparent referral option as a secondary feature.'},
  ]
  return (
	<div className="grid md:grid-cols-2 gap-6 mt-10">
	  {points.map((p,i)=> (
		<motion.article key={p.h} className="card p-6" initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
		  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">{p.icon}</div>
		  <div className="font-semibold text-lg">{p.h}</div>
		  <p className="text-gray-600 mt-2">{p.t}</p>
		</motion.article>
	  ))}
	</div>
  )
}
