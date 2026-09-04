'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, PackageCheck, ShieldCheck, Store } from 'lucide-react'
import { motion } from 'framer-motion'

const products = [
  { name: 'Solar emergency light', price: 'R249', category: 'Home & power', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80' },
  { name: 'Wireless earbuds', price: 'R399', category: 'Electronics', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80' },
  { name: 'Everyday backpack', price: 'R459', category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80' },
  { name: 'Kitchen storage set', price: 'R299', category: 'Home & living', image: 'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=80' }
]

export default function HomeClient() {
  return <main>
    <section className="gradient-surface border-b border-slate-100">
      <div className="container-section grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green"><Store className="h-4 w-4" /> South African online marketplace</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">Discover products. Support growing businesses.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">Shop products from approved local suppliers in one place. ConnectNetwork handles the order while suppliers fulfil it directly to you.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="btn btn-primary">Shop products <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/suppliers" className="btn btn-ghost">Sell on ConnectNetwork</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green" /> Approved suppliers</span><span className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-green" /> Secure checkout</span></div>
        </motion.div>
        <motion.div className="flex items-center rounded-3xl bg-white p-6 shadow-xl md:p-8" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <Image src="/logo/logo.jpg" alt="ConnectNetwork — Products, Distribution, Opportunity" width={1536} height={1024} priority className="h-auto w-full" />
        </motion.div>
      </div>
    </section>

    <section className="container-section py-16"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-semibold text-green">SHOP NOW</p><h2 className="section-title mt-1">Featured products</h2></div><Link href="/products" className="font-semibold text-primary hover:underline">View all products</Link></div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map(product => <ProductCard key={product.name} product={product} />)}</div></section>

    <section className="bg-slate-50 py-16"><div className="container-section"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-semibold text-green">SPONSORED</p><h2 className="section-title mt-1">Products in the spotlight</h2><p className="mt-2 text-slate-600">Paid placements are clearly marked. They help suppliers reach more shoppers.</p></div><Link href="/promotion" className="btn btn-ghost">Promote a product</Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{products.slice(0, 3).map(product => <article key={product.name} className="card overflow-hidden"><div className="relative h-48"><Image src={product.image} alt="" fill className="object-cover" /><span className="absolute left-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">SPONSORED</span></div><div className="p-5"><p className="text-sm text-slate-500">{product.category}</p><h3 className="mt-1 text-lg font-bold">{product.name}</h3><div className="mt-4 flex items-center justify-between"><span className="font-bold text-primary">{product.price}</span><Link href="/products" className="text-sm font-semibold text-primary">View product</Link></div></div></article>)}</div></div></section>

    <section className="container-section py-16"><div className="rounded-3xl bg-gradient-to-br from-navy to-blue-700 p-8 text-white md:p-12"><div className="max-w-2xl"><p className="font-semibold text-blue-100">FOR GROWING BUSINESSES</p><h2 className="mt-2 text-3xl font-bold md:text-4xl">Put your store in front of active shoppers.</h2><p className="mt-4 text-blue-100">Apply as a supplier to list products and fulfil orders. Choose a sponsored business placement when you want more visibility for your whole catalogue.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/suppliers" className="btn bg-white text-navy hover:bg-blue-50">Become a supplier</Link><Link href="/promotion" className="btn border border-white/40 text-white hover:bg-white/10">Business advertising</Link></div></div></div></section>

    <section className="bg-slate-50 py-16"><div className="container-section"><p className="text-center font-semibold text-green">HOW IT WORKS</p><h2 className="section-title mt-1 text-center">Simple shopping. Direct fulfilment.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{[{ title: 'Discover', body: 'Browse products from approved suppliers and compare options.' }, { title: 'Checkout', body: 'Pay securely through ConnectNetwork when you are ready to buy.' }, { title: 'Receive', body: 'Your supplier prepares and delivers your order, with updates along the way.' }].map((step, index) => <article key={step.title} className="card p-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">{index + 1}</span><h3 className="mt-4 text-xl font-bold">{step.title}</h3><p className="mt-2 text-slate-600">{step.body}</p></article>)}</div></div></section>
  </main>
}

function ProductCard({ product }: { product: typeof products[number] }) {
  return <article className="card group overflow-hidden"><div className="relative h-52 overflow-hidden"><Image src={product.image} alt={product.name} fill className="object-cover transition duration-300 group-hover:scale-105" /></div><div className="p-5"><p className="text-sm text-slate-500">{product.category}</p><h3 className="mt-1 text-lg font-bold">{product.name}</h3><div className="mt-4 flex items-center justify-between"><span className="font-bold text-primary">{product.price}</span><Link href="/products" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">View</Link></div></div></article>
}
