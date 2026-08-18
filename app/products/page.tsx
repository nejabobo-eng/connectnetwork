export const metadata = { title: 'What We Promote — ConnectNetwork', description: 'ConnectNetwork promotes businesses, products, services and special offers. Get your business, products or services promoted to our audience and network.', alternates: { canonical: 'https://connectnetwork.co.za/products' } } as const

import ProductsClient from './Client'

export default function ProductsPage(){
  return <ProductsClient />
}
