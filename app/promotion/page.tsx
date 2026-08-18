export const metadata = { title: 'How We Promote Your Business — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/promotion' } } as const

import PromotionClient from './Client'

export default function PromotionPage(){
  return (
<div className="container-section py-16">
  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">How We Promote Your Business</span></h1>
  <p className="section-subtitle mt-2">We use our network, audience, connections and marketing capabilities to help businesses increase visibility for their businesses, products and services.</p>
  <PromotionClient />
</div>
  )
}
