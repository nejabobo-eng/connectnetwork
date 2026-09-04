'use client'
import { addToCart } from '@/app/cart/CartClient'
export default function AddToCartButton({ product }: { product: { id: string; name: string; price: number } }) { return <button onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price })} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Add to cart</button> }
