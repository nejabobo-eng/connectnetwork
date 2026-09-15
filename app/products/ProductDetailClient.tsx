'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AddToCartButton from '@/components/AddToCartButton'

type Product = { id: string; name: string; description?: string | null; category?: string | null; image_url?: string | null; retail_price_cents?: number | null }

export default function ProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState('Loading product…')

  useEffect(() => {
    fetch('/api/products').then(async response => {
      const body = await response.json().catch(() => ({}))
      const item = Array.isArray(body.products) ? body.products.find((candidate: Product & { slug?: string | null }) => candidate.id === productId || candidate.slug === productId) : null
      if (!response.ok || !item) throw new Error()
      setProduct(item)
      setMessage('')
    }).catch(() => setMessage('This product is no longer available.'))
  }, [productId])

  if (!product) return <main className="container-section py-16"><Link href="/products" className="text-sm font-semibold text-primary">← Back to shop</Link><p className="mt-8 text-slate-600">{message}</p></main>
  const canBuy = typeof product.retail_price_cents === 'number' && product.retail_price_cents > 0
  return <main className="container-section py-16"><Link href="/products" className="text-sm font-semibold text-primary">← Back to shop</Link><section className="mt-6 grid gap-10 md:grid-cols-2">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-96 w-full rounded-2xl object-cover" /> : <div className="flex h-96 items-end rounded-2xl bg-gradient-to-br from-navy to-blue-700 p-8 text-3xl font-bold text-white">{product.name}</div>}<div><p className="text-sm text-slate-500">{product.category || 'Marketplace'}</p><h1 className="mt-2 text-4xl font-bold">{product.name}</h1><p className="mt-4 text-2xl font-bold text-primary">{canBuy ? `R${(product.retail_price_cents! / 100).toFixed(2)}` : 'Pricing pending'}</p><p className="mt-6 text-slate-600">{product.description || 'Product details will be confirmed before fulfilment.'}</p><div className="mt-8">{canBuy ? <AddToCartButton product={{ id: product.id, name: product.name, price: product.retail_price_cents! }} /> : <p className="text-sm font-medium text-amber-800">This product is being prepared and is not available for checkout yet.</p>}</div></div></section></main>
}
