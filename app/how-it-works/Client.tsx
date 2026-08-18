"use client"
import { motion } from 'framer-motion'
import { MessageCircle, Sparkles, Share2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksClient(){
  const steps = [
	{
	  step: 1,
	  title: 'Tell Us About Your Business',
	  desc: 'Share information about your business, products or services. Tell us what you want to promote and provide contact details customers can use to reach you.',
	  icon: MessageCircle
	},
	{
	  step: 2,
	  title: 'We Prepare Your Promotion',
	  desc: 'Our team reviews your business information and prepares promotional content suited to what you offer. We create content that resonates with your target audience.',
	  icon: Sparkles
	},
	{
	  step: 3,
	  title: 'We Promote Your Business',
	  desc: 'Your business and products are promoted through our website, social media, WhatsApp network, targeted marketing campaigns, and selected advertising channels.',
	  icon: Share2
	},
	{
	  step: 4,
	  title: 'Customers Discover You',
	  desc: 'Interested customers see your business in our promotional channels and contact you directly. You handle the customer relationship, sales, and fulfillment.',
	  icon: CheckCircle
	},
  ]

  return (
	<div>
	  {/* Hero */}
	  <section className="container-section py-16">
		<motion.div initial={{y:20,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{duration:0.7}}>
		  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">How ConnectNetwork Works</span></h1>
		  <p className="section-subtitle mt-4 max-w-3xl">
			Getting your business promoted is simple. Follow these four steps and start reaching more customers.
		  </p>
		</motion.div>
	  </section>

	  {/* Steps */}
	  <section className="bg-gray-50 py-20">
		<div className="container-section">
		  <div className="grid md:grid-cols-2 gap-8">
			{steps.map((item, i) => {
			  const IconComponent = item.icon
			  return (
				<motion.div
				  key={item.step}
				  className="card p-8 hover:shadow-lg hover:-translate-y-0.5 transition"
				  initial={{y:16,opacity:0}}
				  whileInView={{y:0,opacity:1}}
				  viewport={{once:true}}
				  transition={{delay:i*0.1}}
				>
				  <div className="flex items-start gap-4">
					<div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
					  {item.step}
					</div>
					<div>
					  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
					  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
					</div>
				  </div>
				</motion.div>
			  )
			})}
		  </div>
		</div>
	  </section>

	  {/* Flow Chart */}
	  <section className="container-section py-16">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-2xl md:text-3xl font-semibold mb-8"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">The Promotion Process</span></h2>

		  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8 md:p-12">
			<div className="grid md:grid-cols-4 gap-4 md:gap-2">
			  {['Your Business Details', 'Promotional Content Created', 'Promotion Launched', 'Customers Contact You'].map((stage, i) => (
				<div key={i} className="text-center">
				  <div className="bg-white border-2 border-primary rounded-lg p-4 mb-2">
					<p className="text-sm font-semibold text-primary">{stage}</p>
				  </div>
				  {i < 3 && (
					<div className="text-primary text-2xl mb-2">→</div>
				  )}
				</div>
			  ))}
			</div>
		  </div>
		</motion.div>
	  </section>

	  {/* Timeline */}
	  <section className="bg-gray-50 py-16">
		<div className="container-section">
		  <motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<h2 className="text-2xl md:text-3xl font-semibold mb-8"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Timeline</span></h2>

			<div className="max-w-2xl space-y-6">
			  {[
				{ heading: 'Promote My Business', timing: 'Day 1', desc: 'Send us your business information through our contact form or get in touch directly.' },
				{ heading: 'Discussion', timing: 'Days 1-3', desc: 'We discuss your promotion needs, what you want to promote, and available packages.' },
				{ heading: 'Setup', timing: 'Days 3-5', desc: 'Once you sign up, we prepare your promotional content and schedule promotion across our channels.' },
				{ heading: 'Promotion Starts', timing: 'Week 2+', desc: 'Your business begins appearing in our promotional channels. Customers start discovering you.' },
				{ heading: 'Ongoing Support', timing: 'Monthly', desc: 'We continue promoting your business throughout your subscription period.' },
			  ].map((item, i) => (
				<motion.div
				  key={i}
				  className="flex gap-6 items-start"
				  initial={{x:-20,opacity:0}}
				  whileInView={{x:0,opacity:1}}
				  viewport={{once:true}}
				  transition={{delay:i*0.05}}
				>
				  <div className="flex-shrink-0">
					<div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-bold text-sm">
					  {i+1}
					</div>
				  </div>
				  <div className="flex-grow">
					<h3 className="font-semibold text-lg">{item.heading}</h3>
					<p className="text-primary text-sm font-medium mt-1">{item.timing}</p>
					<p className="text-gray-600 text-sm mt-2">{item.desc}</p>
				  </div>
				</motion.div>
			  ))}
			</div>
		  </motion.div>
		</div>
	  </section>

	  {/* Key Points */}
	  <section className="container-section py-16">
		<motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
		  <h2 className="text-2xl md:text-3xl font-semibold mb-8"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Key Points to Remember</span></h2>

		  <div className="grid md:grid-cols-2 gap-6">
			{[
			  { title: 'You Remain Independent', desc: 'Your business operates independently. You control pricing, products, customer service and fulfillment.' },
			  { title: 'We Handle Promotion', desc: 'ConnectNetwork focuses on getting your business in front of potential customers through our channels.' },
			  { title: 'Direct Contact', desc: 'Customers interested in your business contact you directly. You build the relationship with your customers.' },
			  { title: 'Monthly Service', desc: 'Promotion continues monthly. You can adjust, upgrade or cancel your promotion package as needed.' },
			  { title: 'Professional Content', desc: 'Your promotional content is created with care and marketing expertise to showcase your business effectively.' },
			  { title: 'Multiple Channels', desc: 'Reach customers across our website, social media, WhatsApp network, campaigns and advertising channels.' },
			].map((item, i) => (
			  <motion.div
				key={i}
				className="card p-6 hover:shadow-lg hover:-translate-y-0.5 transition"
				initial={{y:8,opacity:0}}
				whileInView={{y:0,opacity:1}}
				viewport={{once:true}}
				transition={{delay:i*0.05}}
			  >
				<h3 className="font-semibold text-primary mb-2">{item.title}</h3>
				<p className="text-sm text-gray-600">{item.desc}</p>
			  </motion.div>
			))}
		  </div>
		</motion.div>
	  </section>

	  {/* CTA */}
	  <section className="bg-gradient-to-r from-primary/5 to-secondary/5 py-16 rounded-lg">
		<div className="container-section text-center">
		  <motion.div initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}>
			<h2 className="text-3xl font-semibold mb-4">Ready to Promote Your Business?</h2>
			<p className="text-gray-700 max-w-2xl mx-auto mb-8">
			  Take the first step. <Link href="/contact" className="text-primary font-semibold hover:underline">Promote your business today</Link> and let's discuss how ConnectNetwork can help you reach more customers.
			</p>
			<Link href="/contact" className="btn btn-primary">Promote Your Business</Link>
		  </motion.div>
		</div>
	  </section>
	</div>
  )
}
