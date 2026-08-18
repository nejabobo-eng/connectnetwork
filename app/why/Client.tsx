"use client"
import { Globe2, Target, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function WhyClient(){
  const reasons = [
	{
	  icon: Globe2,
	  title: 'Wider Visibility',
	  desc: 'Reach potential customers across multiple channels. Your business becomes visible to people actively looking for what you offer.'
	},
	{
	  icon: Users,
	  title: 'Our Network & Audience',
	  desc: 'Access to our existing network, connections and audience. Leverage our reach to promote your business without building a following from scratch.'
	},
	{
	  icon: TrendingUp,
	  title: 'Marketing Expertise',
	  desc: 'Your promotional content is prepared with professional marketing expertise. We create content suited to your business type and goals.'
	},
	{
	  icon: Globe2,
	  title: 'Multiple Promotional Channels',
	  desc: 'Website promotion, social media, WhatsApp network, targeted marketing campaigns, and advertising channels give you diverse reach opportunities.'
	},
	{
	  icon: Target,
	  title: 'Affordable Monthly Packages',
	  desc: 'Flexible promotion packages designed for startups, small businesses and established companies. Pay monthly for the promotion services you need.'
	},
	{
	  icon: Users,
	  title: 'Direct Customer Enquiries',
	  desc: 'When customers are interested in your business, they contact you directly. You remain in control of customer relationships and sales.'
	},
  ]

  return (
	<div>
	  <section className="container-section py-16">
		<motion.div initial={{y:20,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{duration:0.7}}>
		  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Why Choose ConnectNetwork?</span></h1>
		  <p className="section-subtitle mt-4 max-w-3xl">
			Marketing your business shouldn't be complicated. ConnectNetwork provides an affordable, professional promotion service that helps businesses of all sizes get noticed.
		  </p>
		</motion.div>

		<div className="grid md:grid-cols-2 gap-6 mt-12">
		  {reasons.map((reason, i) => {
			const IconComponent = reason.icon
			return (
			  <motion.article
				key={reason.title}
				className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition"
				initial={{y:12,opacity:0}}
				whileInView={{y:0,opacity:1}}
				viewport={{once:true}}
				transition={{delay:i*0.05}}
			  >
				<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
				  <IconComponent className="h-6 w-6 text-primary" />
				</div>
				<div className="font-semibold text-lg">{reason.title}</div>
				<p className="text-gray-600 mt-2 text-sm">{reason.desc}</p>
			  </motion.article>
			)
		  })}
		</div>
	  </section>

	  {/* How Different Are We */}
	  <section className="bg-gray-50 py-16">
		<div className="container-section">
		  <motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<h2 className="text-3xl font-semibold"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">What Makes ConnectNetwork Different?</span></h2>
			<div className="grid md:grid-cols-2 gap-8 mt-10">
			  <div className="card p-8 bg-white">
				<h3 className="text-xl font-semibold text-primary mb-4">We Focus on Promotion</h3>
				<p className="text-gray-700 mb-4">
				  ConnectNetwork specializes in promoting your business. We help you get discovered.
				</p>
				<ul className="space-y-3 text-sm text-gray-700">
				  <li className="flex gap-2"><span className="text-primary">✓</span> Professional promotional content</li>
				  <li className="flex gap-2"><span className="text-primary">✓</span> Multiple promotional channels</li>
				  <li className="flex gap-2"><span className="text-primary">✓</span> Affordable monthly service</li>
				  <li className="flex gap-2"><span className="text-primary">✓</span> Direct customer connections</li>
				</ul>
			  </div>
			  <div className="card p-8 bg-white">
				<h3 className="text-xl font-semibold text-primary mb-4">You Remain Independent</h3>
				<p className="text-gray-700 mb-4">
				  Your business stays independent. You control your products, pricing, customer service and fulfillment.
				</p>
				<ul className="space-y-3 text-sm text-gray-700">
				  <li className="flex gap-2"><span className="text-primary">✓</span> Your business, your decisions</li>
				  <li className="flex gap-2"><span className="text-primary">✓</span> You handle customer relationships</li>
				  <li className="flex gap-2"><span className="text-primary">✓</span> You control pricing and offerings</li>
				  <li className="flex gap-2"><span className="text-primary">✓</span> Direct contact with customers</li>
				</ul>
			  </div>
			</div>
		  </motion.div>
		</div>
	  </section>

	  {/* What You Need to Know */}
	  <section className="container-section py-16">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-3xl font-semibold mb-6"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">What To Know About ConnectNetwork</span></h2>
		  <div className="max-w-3xl space-y-6 text-gray-700">
			<div>
			  <h3 className="font-semibold text-lg mb-2">We're a Business Promotion Service</h3>
			  <p>
				ConnectNetwork helps businesses promote their businesses, products and services. We are not a distributor, marketplace, or MLM scheme. We focus exclusively on helping businesses get noticed by people interested in what they offer.
			  </p>
			</div>
			<div>
			  <h3 className="font-semibold text-lg mb-2">Monthly Promotion Packages</h3>
			  <p>
				Businesses pay ConnectNetwork a monthly fee for promotion services. Packages are affordable and designed for businesses of all sizes. Contact us to discuss pricing and what promotion would look like for your specific business.
			  </p>
			</div>
			<div>
			  <h3 className="font-semibold text-lg mb-2">You Remain in Control</h3>
			  <p>
				When customers contact you through our promotion, you're in control of the relationship. You set your own terms, pricing, customer service levels and fulfillment methods. ConnectNetwork promotes. You operate your business.
			  </p>
			</div>
			<div>
			  <h3 className="font-semibold text-lg mb-2">Transparent & Professional</h3>
			  <p>
				No hidden terms. No confusing schemes. No pressure to recruit others. Just professional business promotion designed to help you reach more customers affordably.
			  </p>
			</div>
		  </div>
		</motion.div>
	  </section>

	  {/* CTA */}
	  <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-16 rounded-lg">
		<div className="container-section text-center">
		  <motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<h2 className="text-3xl font-semibold mb-4">Ready to Grow Your Business?</h2>
			<p className="text-gray-700 max-w-2xl mx-auto mb-8">
			  Let's discuss how ConnectNetwork can help get your business, products or services in front of more customers.
			</p>
			<Link href="/contact" className="btn btn-primary">Promote Your Business</Link>
		  </motion.div>
		</div>
	  </section>
	</div>
  )
}
