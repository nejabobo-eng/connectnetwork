"use client"
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, PackageCheck, Users, HandCoins, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function HomeClient() {
  return (
	<div>
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
			<h1 className="section-title text-4xl md:text-6xl leading-tight">Connecting Products. Connecting People.</h1>
			<p className="section-subtitle mt-4 max-w-2xl">
			  A South African distribution company supplying quality household products. Choose to use the products or become a distributor and earn referral rewards under our Distributor Rewards Plan.
			</p>
			<div className="mt-8 flex gap-4">
			  <Link href="#learn-more" className="btn btn-primary">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
			  <Link href="/contact" className="btn btn-ghost">Contact Us</Link>
			</div>
			  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700" aria-label="Key assurances">
			  {[
				'Quality Products',
				'Trusted Distribution',
				'Growing Community'
			  ].map((label, i) => (
				<div key={label} className="flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-3 py-2 shadow-sm">
				  <CheckCircle className="h-4 w-4 text-green-600" aria-hidden />
				  <span>{label}</span>
				</div>
			  ))}
			</div>
		  </motion.div>
		  <motion.div className="relative h-[420px] md:h-[520px]" initial={{scale:0.96, opacity:0}} whileInView={{scale:1, opacity:1}} viewport={{once:true}} transition={{duration:0.8}}>
			<SupplyChainIllustration />
		  </motion.div>
		</div>
	  </section>

	  <section id="learn-more" className="container-section py-20">
		<SectionTitle title="How ConnectNetwork Works" center />
		<div className="grid md:grid-cols-4 gap-6 mt-10">
			{[
			{title:'Purchase the Starter Pack',img:'/illustrations/distribution.svg'},
			{title:'Receive your products',img:'/illustrations/cleaning.svg'},
			{title:'Use or recommend them',img:'/illustrations/community.svg'},
			{title:'Earn commission for referrals',img:'/illustrations/referral.svg'},
		  ].map((s,i)=> (
			<motion.div key={i} className="card p-5 hover:shadow-lg transition hover:-translate-y-0.5" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
				<div className="relative h-40 w-full mb-4">
				<Image src={s.img} alt="" fill className="object-contain p-6" />
			  </div>
			  <div className="font-semibold">{s.title}</div>
			</motion.div>
		  ))}
		</div>
	  </section>

		<section className="bg-gray-50 py-20">
		<div className="container-section">
		  <SectionTitle title="Why ConnectNetwork?" center />
		  <div className="grid md:grid-cols-4 gap-6 mt-10">
			<FeatureCard icon={<PackageCheck className="h-6 w-6 text-primary" />} title="Quality Products" desc="Products used every day." />
			<FeatureCard icon={<Users className="h-6 w-6 text-primary" />} title="Nationwide Network" desc="Growing distribution throughout South Africa." />
			<FeatureCard icon={<HandCoins className="h-6 w-6 text-primary" />} title="Extra Income" desc="Optional opportunity to earn referral commissions." />
			<FeatureCard icon={<Users className="h-6 w-6 text-primary" />} title="Community" desc="Helping ordinary South Africans build sustainable income." />
		  </div>
		</div>
	  </section>

	  <section className="container-section py-20" aria-labelledby="our-promise">
		<SectionTitle title="Our Promise" center />
		<div id="our-promise" className="mt-6 max-w-3xl mx-auto text-gray-700 text-center leading-relaxed">
		  At ConnectNetwork, we are committed to supplying quality products, treating our customers and distributors with honesty and respect, and building a sustainable distribution network that creates value for everyone involved. We believe long-term success is built on trust, reliable service, and products that people genuinely use and appreciate.
		</div>
	  </section>

		<section className="container-section py-20" id="starter-pack">
		  <div className="card p-8 md:p-12 items-start">
			<h3 className="text-2xl md:text-3xl font-semibold">Request Our Product Catalogue</h3>
			<ul className="mt-4 space-y-2 text-gray-700">
			  <li>✓ Genuine products sourced from trusted suppliers</li>
			  <li>✓ Optional distributor registration</li>
			  <li>✓ Access to referral programme (optional)</li>
			  <li>✓ Product support</li>
			</ul>
			<div className="flex flex-col sm:flex-row gap-3 mt-6">
			  <Link href="/contact?subject=Request%20Product%20Catalogue" className="btn btn-primary">Request Product Catalogue</Link>
			  <a href="https://wa.me/27745513626?text=Hi%20ConnectNetwork%2C%20please%20send%20me%20the%20latest%20product%20catalogue." target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Chat on WhatsApp</a>
			</div>
		  </div>
		</section>

		<section id="distributor-registration" className="container-section py-20" aria-labelledby="distributor-registration-title">
		  <SectionTitle title="Distributor Registration Information" center />
		  <div id="distributor-registration-title" className="mt-6 max-w-3xl mx-auto text-gray-700 leading-relaxed">
			<p className="text-center">To register as a ConnectNetwork Distributor, please send us the following information:</p>
			<ol className="list-decimal pl-6 mt-4 space-y-2">
			  <li>Full Name and Surname</li>
			  <li>South African ID Number (or Passport Number if applicable)</li>
			  <li>Mobile Number</li>
			  <li>Email Address (if available)</li>
			  <li>Physical Address</li>
			  <li>Bank Name</li>
			  <li>Account Holder's Name</li>
			  <li>Bank Account Number</li>
			  <li>Branch Code (if applicable)</li>
			  <li>Account Type (Cheque or Savings)</li>
			  <li>Referring Distributor ID (Required)</li>
			</ol>
			<p className="mt-6">Once we receive your information and confirm your payment, we will:</p>
			<ul className="list-disc pl-6 mt-2 space-y-2">
			  <li>Register you as a ConnectNetwork Distributor.</li>
			  <li>Allocate your unique Distributor ID.</li>
			  <li>Arrange delivery or collection of your product package.</li>
			  <li>Send you all the information you need to start promoting ConnectNetwork products.</li>
			</ul>
			<p className="mt-6">If you have any questions before registering, please contact us via WhatsApp or email.</p>
			<div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
			  <a
				className="btn btn-primary"
				href="https://wa.me/27745513626?text=I%20would%20like%20to%20register%20as%20a%20ConnectNetwork%20Distributor.%20Here%20are%20my%20details%3A%0A%0AFull%20Name%20and%20Surname%3A%20%0ASouth%20African%20ID%20or%20Passport%3A%20%0AMobile%20Number%3A%20%0AEmail%20Address%20(if%20available)%3A%20%0APhysical%20Address%3A%20%0ABank%20Name%3A%20%0AAccount%20Holder%27s%20Name%3A%20%0ABank%20Account%20Number%3A%20%0ABranch%20Code%20(if%20applicable)%3A%20%0AAccount%20Type%20(Cheque%20or%20Savings)%3A%20%0AReferring%20Distributor%20ID%20(Required)%3A%20"
				target="_blank"
				rel="noopener noreferrer"
			  >
				Send on WhatsApp
			  </a>
			  <Link href="/contact?subject=Distributor%20Registration" className="btn btn-ghost">Email Us</Link>
			</div>
		  </div>
		</section>

		<section className="container-section py-20" aria-labelledby="about-cn">
		  <SectionTitle title="About ConnectNetwork" center />
		  <div id="about-cn" className="max-w-4xl mx-auto text-center text-gray-700 mt-6 space-y-4 leading-relaxed">
			<p>ConnectNetwork is a South African product distribution network connecting manufacturers, suppliers, distributors, and customers.</p>
			<p>Our mission is to help emerging suppliers grow their businesses while creating income opportunities for distributors through the promotion and distribution of quality products.</p>
			<p>We are committed to integrity, quality, and building lasting partnerships across South Africa.</p>
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

function SupplyChainIllustration(){
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
		{x:140,y:260,label:'Supplier'},
		{x:300,y:150,label:'ConnectNetwork'},
		{x:460,y:260,label:'Distributor'},
		{x:620,y:370,label:'Customer'},
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
