"use client"
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Globe2, Share2, MessageCircle, Megaphone, Radio, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function HomeClient() {
  return (
	<div>
	  {/* Hero Section */}
	  <section className="relative min-h-[88vh] overflow-hidden gradient-surface">
		<svg className="absolute -z-10 inset-0 w-full h-full opacity-40" aria-hidden>
		  <defs>
			<linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
			  <stop offset="0%" stopColor="#0A4D8C" stopOpacity="0.35" />
			  <stop offset="100%" stopColor="#2E8B57" stopOpacity="0.35" />
			</linearGradient>
		  </defs>
		  <motion.g initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2}}>
			{[...Array(12)].map((_,i)=> (
			  <motion.path key={i} d={`M -50 ${i*80} C 25 ${i*80+60}, 75 ${i*80-60}, 120% ${i*80}`} stroke="url(#grad)" strokeWidth="1" fill="none"
				initial={{pathLength:0}}
				animate={{pathLength:1}}
				transition={{delay:i*0.08, duration:2.4, repeat:Infinity, repeatType:'mirror', repeatDelay:4}}
			  />
			))}
		  </motion.g>
		</svg>

		<div className="container-section grid md:grid-cols-2 gap-10 items-center min-h-[88vh] py-24">
			<motion.div initial={{y:20, opacity:0}} whileInView={{y:0, opacity:1}} viewport={{once:true}} transition={{duration:0.7}}>
			<img src="/logo/logo.jpg" alt="ConnectNetwork logo" className="h-16 md:h-24 w-auto mb-4" />
			<h1 className="section-title text-4xl md:text-6xl leading-tight">Get Your Business Seen. Get Your Products Noticed.</h1>
			<p className="section-subtitle mt-4 max-w-2xl">
			  ConnectNetwork helps businesses promote their businesses, products and services through our network, audience, connections and marketing capabilities � helping you create awareness and reach more potential customers.
			</p>
			<div className="mt-8 flex gap-4">
			  <Link href="/contact" className="btn btn-primary">Promote My Business <ArrowRight className="ml-2 h-4 w-4" /></Link>
			  <Link href="/promotion" className="btn btn-ghost">How We Promote</Link>
			</div>
			  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700" aria-label="Key services">
			  {[
				'Wider Visibility',
				'Professional Network',
				'Marketing Expertise'
			  ].map((label) => (
				<div key={label} className="flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-3 py-2 shadow-sm">
				  <CheckCircle className="h-4 w-4 text-green-600" aria-hidden />
				  <span>{label}</span>
				</div>
			  ))}
			</div>
		  </motion.div>
		  <motion.div className="relative h-[420px] md:h-[520px]" initial={{scale:0.96, opacity:0}} whileInView={{scale:1, opacity:1}} viewport={{once:true}} transition={{duration:0.8}}>
			<PromotionNetworkIllustration />
		  </motion.div>
		</div>
	  </section>

	  {/* Value Proposition */}
	  <section className="container-section py-20">
		<div className="text-center max-w-3xl mx-auto">
		  <h2 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Your Business. Our Network. More Visibility.</span></h2>
		  <p className="mt-6 text-gray-700 leading-relaxed">
			Having a great business or product is only part of the challenge. You also need visibility and awareness to reach potential customers. ConnectNetwork uses its network, audience and marketing capabilities to help businesses create awareness and reach people who are interested in what you offer.
		  </p>
		</div>
	  </section>

	  {/* What We Promote */}
	  <section className="bg-gray-50 py-20">
		<div className="container-section">
		  <SectionTitle title="What We Promote" center />
		  <div className="grid md:grid-cols-4 gap-6 mt-10">
			{[
			  {title: 'Businesses', desc: 'Increase awareness around your brand and what your business offers.'},
			  {title: 'Products', desc: 'Put your products in front of potential customers.'},
			  {title: 'Services', desc: 'Showcase the services you provide and help people discover your business.'},
			  {title: 'Special Offers', desc: 'Promote campaigns, specials and new products.'},
			].map((item, i) => (
			  <motion.div key={i} className="card p-6 hover:shadow-lg transition hover:-translate-y-0.5" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
				<div className="font-semibold text-lg mb-2">{item.title}</div>
				<p className="text-gray-600 text-sm">{item.desc}</p>
			  </motion.div>
			))}
		  </div>
		</div>
	  </section>

	  {/* Why ConnectNetwork */}
	  <section className="container-section py-20">
		<SectionTitle title="Why ConnectNetwork?" center />
		<div className="grid md:grid-cols-3 gap-6 mt-10">
		  <FeatureCard icon={<Globe2 className="h-6 w-6 text-primary" />} title="Wider Visibility" desc="Reach potential customers across multiple channels." />
		  <FeatureCard icon={<MessageCircle className="h-6 w-6 text-primary" />} title="Existing Network & Audience" desc="Access to our connections and growing audience." />
		  <FeatureCard icon={<Megaphone className="h-6 w-6 text-primary" />} title="Marketing Expertise" desc="Professional promotion prepared for your business." />
		  <FeatureCard icon={<Share2 className="h-6 w-6 text-primary" />} title="Multiple Channels" desc="Promotional reach across website, social media, WhatsApp and more." />
		  <FeatureCard icon={<CheckCircle className="h-6 w-6 text-primary" />} title="Affordable Monthly Service" desc="Promotion packages designed for businesses of all sizes." />
		  <FeatureCard icon={<Radio className="h-6 w-6 text-primary" />} title="Direct Customer Enquiries" desc="Customers can contact your business directly when interested." />
		</div>
	  </section>

	  {/* Our Promotion Network */}
	  <section className="bg-gray-50 py-20">
		<div className="container-section">
		  <SectionTitle title="Our Promotion Network" center />
		  <p className="mt-4 max-w-3xl mx-auto text-center text-gray-700 mb-10">More than a listing. More than an advert. ConnectNetwork brings together different promotional opportunities to help your business gain visibility.</p>
		  <div className="grid md:grid-cols-5 gap-6">
			{[
			  {icon: Globe2, title: 'Website Promotion', desc: 'Showcase your business and products online.'},
			  {icon: Share2, title: 'Social Media', desc: 'Reach audiences through our digital channels.'},
			  {icon: MessageCircle, title: 'WhatsApp', desc: 'Share relevant businesses and offers with our network.'},
			  {icon: Megaphone, title: 'Marketing Campaigns', desc: 'Participate in targeted promotional campaigns.'},
			  {icon: Radio, title: 'Radio & Media', desc: 'Selected campaigns promoted through advertising channels.'},
			].map((item, i) => {
			  const IconComponent = item.icon
			  return (
				<motion.div key={i} className="card p-6 text-center hover:shadow-lg transition hover:-translate-y-0.5" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
				  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
					<IconComponent className="h-6 w-6 text-primary" />
				  </div>
				  <div className="font-semibold mb-2">{item.title}</div>
				  <p className="text-gray-600 text-sm">{item.desc}</p>
				</motion.div>
			  )
			})}
		  </div>
		</div>
	  </section>

	  {/* How It Works */}
	  <section className="container-section py-20">
		<SectionTitle title="How It Works" center />
		<div className="grid md:grid-cols-4 gap-6 mt-10">
		  {[
			{step: '1', title: 'Tell us about your business', desc: 'Share your business information, products or services and contact details.'},
			{step: '2', title: 'We prepare your promotion', desc: 'Our team prepares promotional content suited to your business.'},
			{step: '3', title: 'We promote your business', desc: 'Your business and products are promoted through our channels.'},
			{step: '4', title: 'Customers discover you', desc: 'Interested customers can contact your business directly.'},
		  ].map((item, i) => (
			<motion.div key={i} className="card p-6 hover:shadow-lg transition hover:-translate-y-0.5" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
			  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-3">
				{item.step}
			  </div>
			  <div className="font-semibold mb-2">{item.title}</div>
			  <p className="text-gray-600 text-sm">{item.desc}</p>
			</motion.div>
		  ))}
		</div>
	  </section>

	  {/* Monthly Promotion CTA */}
	  <section className="bg-gray-50 py-20">
		<div className="container-section">
		  <div className="card p-8 md:p-12">
			  <h3 className="text-2xl md:text-3xl font-semibold text-center">Ready to Get Your Business Noticed?</h3>
			  <p className="mt-4 max-w-2xl mx-auto text-center text-gray-700">
				Tell us what you want to promote and we'll discuss the available promotion options with you.
			  </p>
			  <p className="mt-4 max-w-2xl mx-auto text-center text-gray-600 text-sm">
				Affordable monthly promotion packages available.
			  </p>
			  <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
				<Link href="/contact" className="btn btn-primary">Promote My Business</Link>
			  <Link href="/why" className="btn btn-ghost">Learn More</Link>
			</div>
		  </div>
		</div>
	  </section>
	</div>
  )
}

function FeatureCard({icon,title,desc}:{icon:ReactNode,title:string,desc:string}){
  return (
	<div className="card p-6 hover:shadow-lg transition hover:-translate-y-0.5">
	  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
		{icon}
	  </div>
	  <div className="font-semibold">{title}</div>
	  <div className="text-gray-600 text-sm mt-1">{desc}</div>
	</div>
  )
}

function SectionTitle({title, center=false}:{title:string, center?:boolean}){
  return (
	<div className={center? 'text-center' : ''}>
	  <h2 className="section-title">
		<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{title}</span>
	  </h2>
	</div>
  )
}

function PromotionNetworkIllustration(){
  return (
	<svg viewBox="0 0 720 520" className="w-full h-full">
	  <defs>
		<linearGradient id="nodeFill" x1="0" y1="0" x2="1" y2="1">
		  <stop offset="0%" stopColor="#0A4D8C" />
		  <stop offset="100%" stopColor="#2E8B57" />
		</linearGradient>
		<linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
		  <stop offset="0%" stopColor="#0A4D8C" stopOpacity="0.10" />
		  <stop offset="100%" stopColor="#2E8B57" stopOpacity="0.10" />
		</linearGradient>
		<marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto-start-reverse">
		  <path d="M0,0 L0,6 L6,3 z" fill="#0A4D8C" />
		</marker>
	  </defs>
	  <rect x="40" y="40" width="640" height="440" rx="28" fill="url(#panel)" />
	  {[
		{x:140,y:260,label:'Your Business'},
		{x:300,y:150,label:'ConnectNetwork'},
		{x:460,y:260,label:'Our Network'},
		{x:620,y:370,label:'Customers'},
	  ].map((n,i)=> (
		<g key={i}>
		  <circle cx={n.x} cy={n.y} r={28} fill="#fff" stroke="url(#nodeFill)" strokeWidth="4" />
		  <text x={n.x} y={n.y+48} textAnchor="middle" fontSize="13" fill="#0f172a">{n.label}</text>
		</g>
	  ))}
	  <g stroke="#0A4D8C" strokeWidth="2" fill="none" markerEnd="url(#arrow)">
		<path d="M 168 260 C 210 230, 240 200, 300 150" />
		<path d="M 328 150 C 380 190, 410 220, 460 260" />
		<path d="M 488 260 C 540 300, 570 330, 620 370" />
	  </g>
	  <circle cx="300" cy="150" r="38" fill="none" stroke="url(#nodeFill)" strokeWidth="2" opacity="0.5">
		<animate attributeName="r" values="38;46;38" dur="5s" repeatCount="indefinite" />
	  </circle>
	</svg>
  )
}
