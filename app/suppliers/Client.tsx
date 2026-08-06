"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SuppliersClient(){
  return (
	<div className="container-section py-16">
	  <section className="text-center max-w-4xl mx-auto">
		<h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Grow Your Sales Through ConnectNetwork</span></h1>
		<p className="section-subtitle mt-3">ConnectNetwork helps suppliers reach more customers through our growing network of independent distributors across South Africa.</p>
		<div className="mt-6 flex justify-center gap-3">
		  <a href="https://wa.me/27745513626?text=Hello%20ConnectNetwork.%20I%20am%20interested%20in%20becoming%20a%20supplier.%20Please%20share%20the%20next%20steps." target="_blank" rel="noopener noreferrer" className="btn btn-primary">Become a Supplier</a>
		  <Link href="/contact?subject=Supplier%20Partnership" className="btn btn-ghost">Contact Us</Link>
		</div>
	  </section>

	  <section className="mt-16">
		<h2 className="text-2xl md:text-3xl font-semibold text-center">You Supply. We Connect. Distributors Sell.</h2>
		<div className="grid md:grid-cols-3 gap-6 mt-8">
		  {[
			{t:'Apply to become a supplier',d:'Tell us about your products and business.'},
			{t:'Products are reviewed',d:'We assess quality, demand, and fit with our network.'},
			{t:'Approved products added',d:'Your products are listed in the ConnectNetwork catalogue.'},
			{t:'Distributors promote and sell',d:'Our registered distributors market your products nationwide.'},
			{t:'You fulfil orders',d:'Ship products to customers per agreed terms.'},
			{t:'We manage commissions',d:'ConnectNetwork handles distributor commissions on qualifying sales.'},
		  ].map((s,i)=> (
			<motion.div key={s.t} className="card p-6" initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
			  <div className="font-semibold">{s.t}</div>
			  <div className="text-gray-700 mt-2 text-sm">{s.d}</div>
			</motion.div>
		  ))}
		</div>
	  </section>

	  <section className="mt-16">
		<h2 className="text-2xl md:text-3xl font-semibold text-center">Why Partner With ConnectNetwork?</h2>
		<ul className="grid md:grid-cols-2 gap-3 mt-8 text-gray-700 max-w-4xl mx-auto">
		  {[
			'Expand your market reach',
			'Access a nationwide distributor network',
			'Focus on production while distributors promote your products',
			'Increase brand visibility',
			'Grow sales without building your own sales force',
		  ].map(x=> (
			<li key={x} className="card p-4">{x}</li>
		  ))}
		</ul>
	  </section>

	  <section className="mt-16">
		<h2 className="text-2xl md:text-3xl font-semibold text-center">Products We Welcome</h2>
		<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-gray-700">
		  {[
			'Household Products',
			'Cleaning Products',
			'Agricultural Products',
			'Poultry Products',
			'Food & Beverage',
			'Stationery',
			'Health & Lifestyle Products',
			'And many more',
		  ].map(x=> (
			<div key={x} className="card p-4 text-center">{x}</div>
		  ))}
		</div>
	  </section>

	  <section className="mt-16 text-center">
		<div className="card p-8 md:p-12">
		  <h3 className="text-2xl md:text-3xl font-semibold">Become a ConnectNetwork Supplier</h3>
		  <p className="mt-3 text-gray-700">Let's grow your business together.</p>
		  <div className="mt-6 flex justify-center gap-3">
			<a href="https://wa.me/27745513626?text=Hello%20ConnectNetwork.%20I%20am%20interested%20in%20becoming%20a%20supplier.%20Please%20share%20the%20next%20steps." target="_blank" rel="noopener noreferrer" className="btn btn-primary">Apply via WhatsApp</a>
			<Link href="/contact?subject=Supplier%20Partnership" className="btn btn-ghost">Contact Us</Link>
		  </div>
		</div>
	  </section>
	</div>
  )
}
