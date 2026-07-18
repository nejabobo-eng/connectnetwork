export const metadata = { title: 'Products — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/products' } } as const
import ProductsClient from './Client'

const products = [
  {
	name: 'Dishwashing Liquid',
	desc: 'Powerful cleaning. Pleasant fragrance. Safe for everyday use.',
	img: 'https://images.unsplash.com/photo-1583947581924-860bda88135a?q=80&w=1400&auto=format&fit=crop',
	benefits: ['Cuts through grease','Fresh scent','Gentle on hands']
  },
  {
	name: 'Multi-Surface Cleaner',
	desc: 'Effective on multiple surfaces for a spotless home.',
	img: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=1400&auto=format&fit=crop',
	benefits: ['Streak-free shine','Fast-drying','Everyday use']
  },
  {
	name: 'Laundry Detergent',
	desc: 'Deep clean with long-lasting freshness.',
	img: 'https://images.unsplash.com/photo-1607281611891-51f7bc1557af?q=80&w=1400&auto=format&fit=crop',
	benefits: ['Tough on stains','Color safe','Fresh scent']
  },
]

export default function ProductsPage(){
  return <ProductsClient />
}
