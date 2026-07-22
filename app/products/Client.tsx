"use client"
import Image from 'next/image'
import { motion } from 'framer-motion'

const categories = [
  { name: 'Household Cleaning Products', icon: '/illustrations/cleaning.svg' },
  { name: 'Home & Lifestyle Products', icon: '/illustrations/community.svg' },
  { name: 'Arts & Décor', icon: '/illustrations/referral.svg' },
  { name: 'Agricultural Products', icon: '/illustrations/distribution.svg' },
  { name: 'Office & School Supplies', icon: '/illustrations/community.svg' },
  { name: 'Food & Beverage Products', icon: '/illustrations/referral.svg' },
  { name: 'Health & Wellness Products', icon: '/illustrations/community.svg' },
]

export default function ProductsClient(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Product Categories</span></h1>
	  <p className="section-subtitle mt-2">ConnectNetwork partners with South African manufacturers and suppliers to distribute quality products through our growing network of distributors.</p>
	  <p className="text-gray-700 mt-2">Our product range continues to expand as we welcome new suppliers and introduce new product lines.</p>
	  <div className="text-sm text-gray-500 mt-4">Current categories include:</div>

	  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
		{categories.map((c)=> (
		  <motion.article className="card p-6 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-lg transition" key={c.name} initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<div className="relative h-14 w-14">
			  <Image src={c.icon} alt="" fill className="object-contain p-1" sizes="56px" />
			</div>
			<div className="font-semibold">{c.name}</div>
		  </motion.article>
		))}
	  </div>

		{/* Product Packages */}
	  <section className="mt-12 space-y-8">
		<h2 className="text-2xl md:text-3xl font-semibold">Product Packages</h2>

		<div className="card p-8">
		  <h3 className="text-xl md:text-2xl font-semibold">ConnectNetwork Starter Package</h3>
		  <p className="mt-3 text-gray-700">Our Starter Package includes a combination of quality household cleaning products for everyday use. It is an ideal introduction to the ConnectNetwork product range.</p>
		  <div className="mt-4 text-sm text-gray-700">
			<div className="font-medium">Suitable for:</div>
			<ul className="list-disc pl-5 mt-1 space-y-1">
			  <li>Homes</li>
			  <li>Small businesses</li>
			  <li>Offices</li>
			</ul>
		  </div>
		</div>

		<div className="card p-8">
		  <h3 className="text-xl md:text-2xl font-semibold">ConnectNetwork Silver Art Collection</h3>
		  <p className="mt-3 text-gray-700">The Silver Art Collection features original canvas artwork in A4 and A3 sizes.</p>
		  <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm text-gray-700">
			<div>
			  <div className="font-medium">Choose from:</div>
			  <ul className="list-disc pl-5 mt-1 space-y-1">
				<li>Portraits</li>
				<li>Landscapes</li>
				<li>Inspirational artwork</li>
				<li>Custom artwork (subject to availability)</li>
			  </ul>
			</div>
			<div>
			  <div className="font-medium">Perfect for:</div>
			  <ul className="list-disc pl-5 mt-1 space-y-1">
				<li>Homes</li>
				<li>Offices</li>
				<li>Gifts</li>
				<li>Small business reception areas</li>
			  </ul>
			</div>
		  </div>
		</div>

		<div className="card p-8">
		  <h3 className="text-xl md:text-2xl font-semibold">ConnectNetwork Gold Art Collection</h3>
		  <p className="mt-3 text-gray-700">The Gold Art Collection showcases premium original canvas artwork in A2 and A1 sizes, designed for those looking to make a statement with unique, professionally produced artwork.</p>
		  <div className="mt-4 text-sm text-gray-700">
			<div className="font-medium">Ideal for:</div>
			<ul className="list-disc pl-5 mt-1 space-y-1">
			  <li>Homes</li>
			  <li>Corporate offices</li>
			  <li>Hotels and guest houses</li>
			  <li>Churches and boardrooms</li>
			</ul>
		  </div>
		  <p className="mt-4 text-xs text-gray-500">Each artwork can include a Certificate of Authenticity signed by the artist.</p>
		</div>

		<div className="card p-8">
		  <h3 className="text-xl md:text-2xl font-semibold">Distributor Opportunity</h3>
		  <p className="mt-3 text-gray-700">Every qualifying product package purchased through ConnectNetwork also provides an opportunity to register as a distributor. Registered distributors may qualify to earn referral commissions by introducing new customers and distributors according to the current <a href="/compensation" className="text-primary underline">Distributor Rewards Plan</a>.</p>
		</div>
	  </section>

	  <div id="catalogue" className="card p-8 md:p-12 mt-12">
		<h3 className="text-2xl md:text-3xl font-semibold">Distributor & Customer Product Catalogue</h3>
		<p className="mt-4 text-gray-700">Rather than displaying a fixed online catalogue, we provide our latest product information directly to interested customers and registered distributors.</p>
		<p className="mt-2 text-gray-700">This ensures you always receive the most up-to-date products, pricing, promotions, and availability.</p>
		<div className="flex flex-col sm:flex-row gap-3 mt-6">
		  <a href="https://wa.me/27745513626?text=Hi%20ConnectNetwork%2C%20please%20send%20me%20the%20latest%20Distributor%20%26%20Customer%20Product%20Catalogue." target="_blank" rel="noopener noreferrer" className="btn btn-primary">Chat on WhatsApp</a>
		  <a href="mailto:info@connectnetwork.co.za?subject=Request%20Distributor%20%26%20Customer%20Product%20Catalogue" className="btn btn-ghost">Request via Email</a>
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
