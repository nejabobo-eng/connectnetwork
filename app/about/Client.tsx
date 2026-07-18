"use client"
import { motion } from 'framer-motion'

export default function AboutClient(){
  return (
	<section className="container-section py-16">
	  <div className="grid md:grid-cols-2 gap-10 items-center">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Who is ConnectNetwork?</span></h1>
		  <p className="section-subtitle mt-4">ConnectNetwork is a South African distribution network focused on delivering quality household products to customers nationwide, supported by a growing community of independent distributors.</p>
		</motion.div>
		<motion.div className="relative h-72" initial={{scale:0.97,opacity:0}} whileInView={{scale:1,opacity:1}} viewport={{once:true}}>
		  <svg viewBox="0 0 600 280" className="w-full h-full">
			<defs>
			  <linearGradient id="a1" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stopColor="#0A4D8C" stopOpacity="0.12" />
				<stop offset="100%" stopColor="#2E8B57" stopOpacity="0.12" />
			  </linearGradient>
			</defs>
			<rect x="0" y="0" width="600" height="280" rx="24" fill="url(#a1)" />
			{Array.from({length:5}).map((_,i)=> (
			  <g key={i} transform={`translate(${80+i*100}, ${80+(i%2)*40})`}>
				<rect x="-30" y="-20" width="60" height="40" rx="10" fill="#fff" stroke="#0A4D8C" opacity="0.8" />
				<circle cx="0" cy="0" r="4" fill="#2E8B57" />
			  </g>
			))}
			<g stroke="#0A4D8C" strokeWidth="1.5" opacity="0.6" fill="none">
			  <path d="M 80 80 C 150 60, 220 80, 280 100" />
			  <path d="M 180 120 C 240 140, 300 140, 380 120" />
			  <path d="M 280 100 C 360 80, 440 100, 520 120" />
			</g>
		  </svg>
		</motion.div>
	  </div>
	</section>
  )
}
