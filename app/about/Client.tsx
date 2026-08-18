"use client"
import { motion } from 'framer-motion'

export default function AboutClient(){
  return (
	<section className="container-section py-16">
	  <div className="grid md:grid-cols-2 gap-10 items-center">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Who is ConnectNetwork?</span></h1>
		  <p className="section-subtitle mt-4">ConnectNetwork is a business promotion and marketing service. We help businesses promote their businesses, products and services to a wider audience using our network, connections and marketing capabilities.</p>
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

	  {/* Our Mission */}
	  <section className="mt-16">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-3xl font-semibold mb-6"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Mission</span></h2>
		  <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
			We believe every business deserves the opportunity to be discovered. Whether you're a startup, small business, or established company, promoting your offerings shouldn't be complicated or expensive. ConnectNetwork connects businesses with potential customers through our network, audience and marketing expertise.
		  </p>
		</motion.div>
	  </section>

	  {/* What We Do */}
	  <section className="mt-16">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-3xl font-semibold mb-6"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">What We Do</span></h2>
		  <div className="grid md:grid-cols-2 gap-8">
			<div className="card p-6">
			  <h3 className="text-lg font-semibold mb-3 text-primary">Promote Your Business</h3>
			  <p className="text-gray-700 text-sm">We take your business information and create promotional content that showcases what you offer. Your business is then promoted through multiple channels in our network.</p>
			</div>
			<div className="card p-6">
			  <h3 className="text-lg font-semibold mb-3 text-primary">Connect with Customers</h3>
			  <p className="text-gray-700 text-sm">Our promotion channels help interested customers discover your business, products and services. When they're interested, they contact you directly to learn more or make a purchase.</p>
			</div>
			<div className="card p-6">
			  <h3 className="text-lg font-semibold mb-3 text-primary">Multiple Channels</h3>
			  <p className="text-gray-700 text-sm">Your business is promoted through our website, social media, WhatsApp network, targeted marketing campaigns, and selected advertising channels.</p>
			</div>
			<div className="card p-6">
			  <h3 className="text-lg font-semibold mb-3 text-primary">Affordable Service</h3>
			  <p className="text-gray-700 text-sm">We offer affordable monthly promotion packages designed for businesses of all sizes. Flexible options mean you only pay for what you need.</p>
			</div>
		  </div>
		</motion.div>
	  </section>

	  {/* Why Businesses Choose ConnectNetwork */}
	  <section className="mt-16">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-3xl font-semibold mb-6"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Why Businesses Choose ConnectNetwork</span></h2>
		  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
			{[
			  {title: 'Visibility', desc: 'Get your business in front of people actively looking for what you offer.'},
			  {title: 'Network Access', desc: 'Leverage our audience, connections and marketing reach.'},
			  {title: 'Professional Promotion', desc: 'Your promotional content is prepared with care and marketing expertise.'},
			  {title: 'Multiple Channels', desc: 'Reach customers across website, social media, WhatsApp and campaigns.'},
			  {title: 'Direct Enquiries', desc: 'Customers contact you directly when interested in your offerings.'},
			  {title: 'Affordable', desc: 'Monthly packages priced for startups, small and established businesses.'},
			].map((item, i) => (
			  <motion.div key={item.title} className="card p-6" initial={{y:8,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
				<h3 className="font-semibold text-primary mb-2">{item.title}</h3>
				<p className="text-sm text-gray-600">{item.desc}</p>
			  </motion.div>
			))}
		  </div>
		</motion.div>
	  </section>

	  {/* Our Values */}
	  <section className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 md:p-12">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-3xl font-semibold mb-6"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Values</span></h2>
		  <div className="grid md:grid-cols-2 gap-6 text-gray-700">
			<div>
			  <p className="mb-4"><strong>Transparency:</strong> We're clear about what we do and how promotion works. No hidden terms or confusing schemes.</p>
			  <p><strong>Professionalism:</strong> Your business deserves professional promotion. We approach every promotional opportunity with care and marketing expertise.</p>
			</div>
			<div>
			  <p className="mb-4"><strong>Results-Focused:</strong> We focus on promoting your business to people genuinely interested in what you offer.</p>
			  <p><strong>Fairness:</strong> Your business operates independently. You control your products, pricing, customer relationships and delivery. We handle the promotion.</p>
			</div>
		  </div>
		</motion.div>
	  </section>

	  {/* Ready to Grow */}
	  <section className="mt-16 text-center">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-3xl font-semibold mb-4">Ready to Get Your Business Noticed?</h2>
		  <p className="text-gray-700 max-w-2xl mx-auto mb-8">Let's discuss how ConnectNetwork can help promote your business, products or services to a wider audience.</p>
		  <a href="/contact" className="btn btn-primary">Promote Your Business</a>
		</motion.div>
	  </section>
	</section>
  )
}
