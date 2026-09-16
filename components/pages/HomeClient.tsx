'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, PackageCheck, Search, ShieldCheck, Store } from 'lucide-react'
import { motion } from 'framer-motion'

type Product = { id: string; name: string; slug?: string | null; category?: string | null; image_url?: string | null; retail_price_cents?: number | null; sponsored?: boolean | null }
const price = (product: Product) => typeof product.retail_price_cents === 'number' ? `R${(product.retail_price_cents / 100).toFixed(2)}` : 'Pricing pending'

export default function HomeClient() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products').then(async response => {
      if (!response.ok) throw new Error('Unable to load products')
      const body = await response.json()
      setProducts(Array.isArray(body.products) ? body.products.slice(0, 4) : [])
    }).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const search = query.trim()
    window.location.assign(search ? `/products?search=${encodeURIComponent(search)}` : '/products')
  }

  return <main>
    <section className="gradient-surface border-b border-slate-100"><div className="container-section grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green"><Store className="h-4 w-4" /> South African online marketplace</p>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">Sponsored finds worth a closer look.</h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">Discover promoted products from approved local suppliers, then shop the full ConnectNetwork marketplace when you are ready.</p>
        <form onSubmit={submitSearch} className="mt-8 flex max-w-xl rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><label className="sr-only" htmlFor="homepage-search">Search products</label><Search className="my-auto ml-3 h-5 w-5 shrink-0 text-slate-400" /><input id="homepage-search" value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-slate-950 outline-none" placeholder="What are you looking for?" /><button type="submit" className="btn btn-primary shrink-0">Search</button></form>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="btn btn-ghost">Browse all products <ArrowRight className="ml-2 h-4 w-4" /></Link><Link href="/suppliers" className="btn btn-ghost">Sell on ConnectNetwork</Link></div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green" /> Approved suppliers</span><span className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-green" /> Secure checkout</span></div>
      </motion.div>
      <motion.div className="flex items-center rounded-3xl bg-white p-6 shadow-xl md:p-8" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}><Image src="/logo/logo.jpg" alt="ConnectNetwork — Products, Distribution, Opportunity" width={1536} height={1024} priority className="h-auto w-full" /></motion.div>
    </div></section>
    <section className="bg-slate-50 py-16"><div className="container-section"><div><h2 className="section-title">Latest products</h2><p className="mt-2 text-slate-600">Explore recently added products from approved suppliers.</p></div>{loading ? <p className="mt-8 text-slate-600">Loading products…</p> : products.length ? <><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map(product => <ProductCard key={product.id} product={product} />)}</div><div className="mt-8 text-center"><Link href="/products" className="btn btn-primary">View all products <ArrowRight className="ml-2 h-4 w-4" /></Link></div></> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">Products will appear here soon. <Link href="/products" className="font-semibold text-primary hover:underline">View all products</Link>.</div>}</div></section>
    <section className="container-section py-16"><div className="rounded-3xl bg-gradient-to-br from-navy to-blue-700 p-8 text-white md:p-12"><div className="max-w-2xl"><p className="font-semibold text-blue-100">FOR GROWING BUSINESSES</p><h2 className="mt-2 text-3xl font-bold md:text-4xl">Put your products in front of active shoppers.</h2><p className="mt-4 text-blue-100">Apply as a supplier to list products and choose a sponsored placement whenever you want extra visibility.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/suppliers" className="btn bg-white text-navy hover:bg-blue-50">Become a supplier</Link><Link href="/promotion" className="btn border border-white/40 text-white hover:bg-white/10">Business advertising</Link></div></div></div></section>
  </main>
}

function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.slug || product.id}`
  return <article className="card group overflow-hidden"><div className="relative h-56 overflow-hidden bg-gradient-to-br from-navy to-blue-700">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <span className="absolute bottom-5 left-5 text-lg font-bold text-white">{product.name}</span>}</div><div className="p-5"><p className="text-sm text-slate-500">{product.category || 'Marketplace'}</p><h3 className="mt-1 text-lg font-bold">{product.name}</h3><div className="mt-4 flex items-center justify-between gap-3"><span className="font-bold text-primary">{price(product)}</span><Link href={href} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">View product</Link></div></div></article>
}
