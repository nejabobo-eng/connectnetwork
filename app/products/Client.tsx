"use client"
import Image from 'next/image'
import { motion } from 'framer-motion'

const products = [
  {
	name: 'Dishwashing Liquid',
	desc: 'Powerful cleaning. Pleasant fragrance. Safe for everyday use.',
	img: '/illustrations/cleaning.svg',
	benefits: ['Cuts through grease','Fresh scent','Gentle on hands']
  },
  {
	name: 'Multi-Surface Cleaner',
	desc: 'Effective on multiple surfaces for a spotless home.',
	img: '/illustrations/cleaning.svg',
	benefits: ['Streak-free shine','Fast-drying','Everyday use']
  },
  {
	name: 'Laundry Detergent',
	desc: 'Deep clean with long-lasting freshness.',
	img: '/illustrations/cleaning.svg',
	benefits: ['Tough on stains','Color safe','Fresh scent']
  },
]

export default function ProductsClient(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Products</span></h1>
	  <p className="section-subtitle mt-2">Large visuals with simple, clear information.</p>

	  <div className="grid md:grid-cols-3 gap-6 mt-10">
		{products.map((p)=> (
		  <motion.article className="card overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition" key={p.name} initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<div className="relative h-56">
			  <Image src={p.img} alt={p.name} fill className="object-contain p-8" sizes="(min-width: 768px) 33vw, 100vw" />
			</div>
			<div className="p-6">
			  <div className="font-semibold text-lg">{p.name}</div>
			  <div className="text-gray-600 text-sm mt-1">{p.desc}</div>
			  <ul className="mt-3 text-sm text-gray-700 list-disc pl-5 space-y-1">
				{p.benefits.map(b => <li key={b}>{b}</li>)}
			  </ul>
			</div>
		  </motion.article>
		))}
	  </div>

	  <div id="starter-pack" className="card p-8 md:p-12 mt-12 grid md:grid-cols-2 gap-8 items-center">
		<div>
		  <h3 className="text-2xl md:text-3xl font-semibold">Starter Pack — R300</h3>
		  <ul className="mt-4 space-y-2 text-gray-700">
			<li>✓ Cleaning products</li>
			<li>✓ Distributor registration (optional)</li>
			<li>✓ Access to referral programme</li>
			<li>✓ Product support</li>
		  </ul>
		</div>
		<div className="relative h-64 md:h-80">
		  <Image src="/illustrations/cleaning.svg" alt="Cleaning products" fill className="object-contain p-8 rounded-3xl" sizes="(min-width: 768px) 50vw, 100vw" />
		</div>
	  </div>
	</div>
  )
}
