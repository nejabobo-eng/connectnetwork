"use client"
import { useState } from 'react'
import { Globe2, Share2, MessageCircle, Megaphone, Radio, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function PromotionClient(){
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [startingCheckout, setStartingCheckout] = useState(false)
  async function startCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStartingCheckout(true); setCheckoutMessage('')
    const response = await fetch('/api/payments/promotion-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) })
    const data = await response.json().catch(() => ({})); setStartingCheckout(false)
    if (response.ok && data.checkoutUrl) window.location.assign(data.checkoutUrl)
    else setCheckoutMessage(data.error || 'Payment could not be started. Please try again.')
  }
  const channels = [
    { icon: Globe2, title: "Website Promotion", desc: "Your business and products are featured on our website, reaching visitors actively looking for business solutions." },
    { icon: Share2, title: "Social Media", desc: "Promotional content is shared across our social media channels to reach a broader audience." },
    { icon: MessageCircle, title: "WhatsApp Network", desc: "Your business is shared with our WhatsApp network, providing direct visibility to engaged connections." },
    { icon: Megaphone, title: "Marketing Campaigns", desc: "We prepare targeted promotional campaigns designed to showcase your business, products and special offers." },
    { icon: Radio, title: "Radio & Media Channels", desc: "Selected businesses may be promoted through radio advertising and other media channels where applicable." },
  ]

  const process = [
    { step: 1, title: "Information Submission", desc: "You provide us with details about your business, products, services, and how customers can contact you." },
    { step: 2, title: "Content Preparation", desc: "Our team reviews your information and prepares promotional content suited to your business type and target audience." },
    { step: 3, title: "Promotional Launch", desc: "Your business is promoted across our network: website, social media, WhatsApp, marketing campaigns, and selected media channels." },
    { step: 4, title: "Customer Discovery", desc: "Interested customers discover your business through our promotional channels and contact you directly to learn more or make a purchase." },
  ]

  return (
<div className="mt-12">
  {/* Promotional Channels */}
  <section className="mb-16">
<h2 className="text-2xl md:text-3xl font-semibold mb-8"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Promotional Channels</span></h2>
<div className="grid md:grid-cols-5 gap-6">
  {channels.map((channel, i) => {
const IconComponent = channel.icon
return (
  <motion.div key={channel.title} className="card p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition" initial={{y:16,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.05}}>
<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
  <IconComponent className="h-6 w-6 text-primary" />
</div>
<div className="font-semibold mb-2">{channel.title}</div>
<p className="text-gray-600 text-sm">{channel.desc}</p>
  </motion.div>
)
  })}
</div>
  </section>

  {/* Promotion Process */}
  <section className="bg-gray-50 rounded-lg p-8">
<h2 className="text-2xl md:text-3xl font-semibold mb-8"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">The Promotion Process</span></h2>
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
  {process.map((item, i) => (
<motion.div key={item.step} className="card p-6" initial={{y:12,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}} transition={{delay:i*0.1}}>
  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mb-4">
{item.step}
  </div>
  <div className="font-semibold mb-2">{item.title}</div>
  <p className="text-gray-600 text-sm">{item.desc}</p>
</motion.div>
  ))}
</div>
  </section>

  {/* Key Points */}
  <section className="mt-12">
<h2 className="text-2xl md:text-3xl font-semibold mb-6"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">What We Provide</span></h2>
<div className="card p-8">
  <ul className="space-y-3">
{[
  "Professional promotional content prepared for your business",
  "Visibility across multiple marketing channels",
  "Access to our network and audience",
  "Direct customer enquiries from interested prospects",
  "Affordable monthly promotion packages",
  "Support in getting your business noticed by potential customers",
].map((point) => (
  <li key={point} className="flex items-start gap-3">
<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
<span className="text-gray-700">{point}</span>
  </li>
))}
  </ul>
</div>
  </section>

  {/* Business Responsibility */}
  <section className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
<h3 className="font-semibold text-lg mb-3 text-blue-900">Your Independence</h3>
<p className="text-gray-700 text-sm leading-relaxed mb-3">
  ConnectNetwork provides promotional services to help you reach potential customers. You remain fully responsible for:
</p>
<ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
  <li className="flex items-start gap-2">
<span className="font-semibold">✓</span>
<span>Your products and services</span>
  </li>
  <li className="flex items-start gap-2">
<span className="font-semibold">✓</span>
<span>Pricing and product availability</span>
  </li>
  <li className="flex items-start gap-2">
<span className="font-semibold">✓</span>
<span>Customer relationships and sales</span>
  </li>
  <li className="flex items-start gap-2">
<span className="font-semibold">✓</span>
<span>Order fulfillment and delivery</span>
  </li>
</ul>
  </section>

  <section className="mt-12 card p-8 max-w-2xl">
    <p className="text-secondary font-semibold">Start promotion</p>
    <h2 className="text-2xl font-semibold mt-1">R100 per month</h2>
    <p className="text-gray-600 mt-2">Securely continue to Yoco to start your monthly ConnectNetwork promotion.</p>
    <form onSubmit={startCheckout} className="mt-5 grid sm:grid-cols-2 gap-4">
      <input name="businessName" required className="border rounded-lg p-3" placeholder="Business name" aria-label="Business name" />
      <input name="email" type="email" required className="border rounded-lg p-3" placeholder="Email address" aria-label="Email address" />
      <button disabled={startingCheckout} className="btn btn-primary sm:col-span-2 justify-self-start">{startingCheckout ? 'Opening secure checkout…' : 'Continue to secure payment'}</button>
    </form>
    {checkoutMessage && <p role="alert" className="mt-3 text-sm text-red-600">{checkoutMessage}</p>}
  </section>
</div>
  )
}
