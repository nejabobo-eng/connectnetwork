export const metadata = { title: 'Shop products — ConnectNetwork', description: 'Browse products from approved ConnectNetwork suppliers.', alternates: { canonical: 'https://connectnetwork.co.za/products' } } as const

import ProductsClient from './Client'

export default function ProductsPage(){
  return <ProductsClient />
}
