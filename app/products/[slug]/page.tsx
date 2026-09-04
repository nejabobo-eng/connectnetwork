import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import { catalog } from '@/lib/catalog'

export default function ProductPage({ params }: { params: { slug: string } }) { const product = catalog.find(item => item.slug === params.slug); if (!product) notFound(); return <main className="container-section py-16"><Link href="/products" className="text-sm font-semibold text-primary">← Back to shop</Link><section className="mt-6 grid gap-10 md:grid-cols-2"><div className="relative h-96 overflow-hidden rounded-2xl"><Image src={product.image} alt={product.name} fill className="object-cover" /></div><div><p className="text-sm text-slate-500">{product.category} · Sold by {product.supplier}</p><h1 className="mt-2 text-4xl font-bold">{product.name}</h1><p className="mt-4 text-2xl font-bold text-primary">R{(product.price / 100).toFixed(2)}</p><p className="mt-6 text-slate-600">{product.description}</p><h2 className="mt-8 text-lg font-bold">Specifications</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">{product.specs.map(spec => <li key={spec}>{spec}</li>)}</ul><div className="mt-8"><AddToCartButton product={product} /></div></div></section></main> }
