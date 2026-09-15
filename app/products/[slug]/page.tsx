import ProductDetailClient from '../ProductDetailClient'

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient productId={params.slug} />
}
