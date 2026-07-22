"use client"
import Image from 'next/image'
import { motion } from 'framer-motion'

const categories = [
  { name: 'Household Cleaning Products', icon: '/illustrations/cleaning.svg' },
  { name: 'Personal Care Products', icon: '/illustrations/community.svg' },
  { name: 'Food & Beverages', icon: '/illustrations/referral.svg' },
  { name: 'Agricultural Products', icon: '/illustrations/distribution.svg' },
  { name: 'Office & School Supplies', icon: '/illustrations/community.svg' },
  { name: 'Health & Wellness Products', icon: '/illustrations/referral.svg' },
]

export default function ProductsClient(){
  return (
	<div className="container-section py-16">
		<h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Product Categories</span></h1>
	  <p className="section-subtitle mt-2">ConnectNetwork works with South African manufacturers and suppliers to distribute quality products through our growing network.</p>

		<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
		{categories.map((c)=> (
		  <motion.article className="card p-6 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-lg transition" key={c.name} initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<div className="relative h-14 w-14">
			  <Image src={c.icon} alt="" fill className="object-contain p-1" sizes="56px" />
			</div>
			<div className="font-semibold">{c.name}</div>
		  </motion.article>
		))}
	  </div>

		<div id="catalogue" className="card p-8 md:p-12 mt-12">
		<h3 className="text-2xl md:text-3xl font-semibold">Request Our Product Catalogue</h3>
		<p className="mt-4 text-gray-700">Our product catalogue is shared directly with registered distributors and qualified customers via WhatsApp or email. This ensures you always receive the latest products, pricing, and promotions.</p>
		<div className="flex flex-col sm:flex-row gap-3 mt-6">
		  <a href="https://wa.me/27745513626?text=Hi%20ConnectNetwork%2C%20please%20send%20me%20the%20latest%20product%20catalogue." target="_blank" rel="noopener noreferrer" className="btn btn-primary">Chat on WhatsApp</a>
		  <a href="mailto:info@connectnetwork.co.za?subject=Request%20Product%20Catalogue" className="btn btn-ghost">Request via Email</a>
		</div>
	  </div>

	  <div className="card p-8 md:p-12 mt-8 grid md:grid-cols-2 gap-8 items-center">
		<div>
		  <h3 className="text-2xl md:text-3xl font-semibold">Silver Package (Coming Soon)</h3>
		  <p className="mt-4 text-gray-700">A premium household product package designed for customers seeking additional value.</p>
		</div>
		<div className="relative h-64 md:h-80">
		  <Image src="/illustrations/community.svg" alt="Silver Package (Coming Soon)" fill className="object-contain p-8 rounded-3xl" sizes="(min-width: 768px) 50vw, 100vw" />
		</div>
	  </div>

	  <div className="card p-8 md:p-12 mt-8 grid md:grid-cols-2 gap-8 items-center">
		<div>
		  <h3 className="text-2xl md:text-3xl font-semibold">Gold Package</h3>
		  <p className="mt-4 text-gray-700">A premium custom canvas artwork package, featuring professionally produced portraits or landscape artwork for homes, offices, or as meaningful gifts.</p>
		</div>
		<div className="relative h-64 md:h-80">
		  <Image src="/illustrations/referral.svg" alt="Gold Package" fill className="object-contain p-8 rounded-3xl" sizes="(min-width: 768px) 50vw, 100vw" />
		</div>
	  </div>
	</div>
  )
}
