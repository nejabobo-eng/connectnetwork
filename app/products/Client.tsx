"use client"
import { motion } from 'framer-motion'
import { Building2, Package, Briefcase, Sparkles } from 'lucide-react'

export default function ProductsClient(){
  const promotionCategories = [
{ icon: Building2, title: 'Businesses', desc: 'Increase awareness around your brand and what your business offers.' },
{ icon: Package, title: 'Products', desc: 'Put your products in front of potential customers.' },
{ icon: Briefcase, title: 'Services', desc: 'Showcase the services you provide and help people discover your business.' },
{ icon: Sparkles, title: 'Special Offers', desc: 'Promote campaigns, specials, launches and new products.' },
  ]

  return (
<div className="container-section py-16">
  <motion.div initial={{y:20, opacity:0}} whileInView={{y:0, opacity:1}} viewport={{once:true}} transition={{duration:0.7}}>
<h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">What We Promote</span></h1>
<p className="section-subtitle mt-4 max-w-3xl">
  ConnectNetwork promotes businesses, products, and services to help them gain visibility and reach customers.
</p>
  </motion.div>

  <div className="grid md:grid-cols-2 gap-8 mt-12">
{promotionCategories.map((category, i) => {
  const IconComponent = category.icon
  return (
<motion.div key={category.title} className="card p-8 hover:shadow-lg hover:-translate-y-0.5 transition" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.1}}>
  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
<IconComponent className="h-7 w-7 text-primary" />
  </div>
  <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
  <p className="text-gray-600 text-sm leading-relaxed">{category.desc}</p>
</motion.div>
  )
})}
  </div>

  <section className="mt-16 py-12 bg-gray-50 rounded-lg p-8">
<h2 className="text-2xl md:text-3xl font-semibold mb-6">How We Promote</h2>
<p className="text-gray-700 max-w-3xl mb-8">
  ConnectNetwork uses multiple channels to get your business in front of potential customers. Content is tailored to your business type.
</p>
<div className="grid md:grid-cols-2 gap-8 mt-8">
  <div>
<h3 className="font-semibold text-lg mb-3">For Businesses</h3>
<p className="text-sm text-gray-700 leading-relaxed">We create awareness. Customers discover what you do and how to contact you.</p>
  </div>
  <div>
<h3 className="font-semibold text-lg mb-3">For Products</h3>
<p className="text-sm text-gray-700 leading-relaxed">Products are showcased, highlighting features and benefits to interested customers.</p>
  </div>
  <div>
<h3 className="font-semibold text-lg mb-3">For Services</h3>
<p className="text-sm text-gray-700 leading-relaxed">Service offerings and expertise are promoted to potential clients.</p>
  </div>
  <div>
<h3 className="font-semibold text-lg mb-3">For Special Offers</h3>
<p className="text-sm text-gray-700 leading-relaxed">Campaigns and offers are promoted to drive customer interest.</p>
  </div>
</div>
  </section>

  <section className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-8">
<h3 className="text-lg font-semibold text-blue-900 mb-4">Important</h3>
<p className="text-sm text-blue-800 leading-relaxed">
  You remain responsible for your operations, products, pricing, delivery and customer service. Customers contact you directly.
</p>
  </section>

  <section className="mt-16 text-center">
<h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to Get Promoted?</h2>
<a href="/contact" className="btn btn-primary">Promote Your Business</a>
  </section>
</div>
  )
}
