'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'

type Product = { id: string; name: string; description?: string | null; category?: string | null; image_url?: string | null; retail_price_cents?: number | null }

const categories = ['All products', 'Electronics', 'Home & Living', 'Fashion', 'Beauty & Personal Care', 'Health & Wellness', 'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Tools & Hardware', 'Office & Business', 'Food & Beverage', 'Other']

function normalizedCategory(value?: string | null) {
  if (value === 'Home & living') return 'Home & Living'
  if (value === 'Beauty & care') return 'Beauty & Personal Care'
  return categories.includes(value || '') ? value! : 'Other'
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All products')
  const [message, setMessage] = useState('Loading products…')

  useEffect(() => {
    fetch('/api/products').then(async response => {
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error()
      setProducts(Array.isArray(body.products) ? body.products : [])
      setMessage('')
    }).catch(() => setMessage('Products could not be loaded. Please refresh the page.'))
  }, [])

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    return products.filter(product => {
      const productCategory = normalizedCategory(product.category)
      return (category === 'All products' || productCategory === category) && (!search || `${product.name} ${product.description || ''} ${productCategory}`.toLowerCase().includes(search))
    })
  }, [category, products, query])

  return <main className="container-section py-16"><h1 className="section-title">Shop products</h1><p className="section-subtitle mt-3">Carefully selected products from ConnectNetwork.</p><input value={query} onChange={event => setQuery(event.target.value)} className="mt-6 w-full rounded-lg border p-3" placeholder="Search products" /><div className="mt-4 flex flex-wrap gap-2">{categories.map(item => <button onClick={() => setCategory(item)} key={item} className={`rounded-full px-4 py-2 ${category === item ? 'bg-primary text-white' : 'bg-slate-100'}`}>{item}</button>)}</div>{message ? <p className="mt-6 text-slate-600">{message}</p> : <><p className="mt-6 font-semibold">{visibleProducts.length} products</p><section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map(product => <article key={product.id} className="card overflow-hidden">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-56 w-full object-cover" /> : <div className="flex h-56 items-end bg-gradient-to-br from-navy to-blue-700 p-5 text-lg font-bold text-white">{product.name}</div>}<div className="p-5"><p className="text-sm text-slate-500">{normalizedCategory(product.category)}</p><h2 className="mt-1 text-xl font-bold">{product.name}</h2><p className="mt-2 font-bold text-primary">{typeof product.retail_price_cents === 'number' ? `R${(product.retail_price_cents / 100).toFixed(2)}` : 'Pricing pending'}</p><div className="mt-4 flex flex-wrap gap-2"><Link href={`/products/${product.id}`} className="rounded-lg border px-4 py-2 text-sm font-semibold">View product</Link>{typeof product.retail_price_cents === 'number' && product.retail_price_cents > 0 && <AddToCartButton product={{ id: product.id, name: product.name, price: product.retail_price_cents }} />}</div></div></article>)}{visibleProducts.length === 0 && <p className="text-slate-600">No approved products match your search yet.</p>}</section></>}</main>
}
