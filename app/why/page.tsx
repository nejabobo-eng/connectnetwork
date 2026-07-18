export const metadata = { title: 'Why ConnectNetwork — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/why' } } as const
import WhyClient from './Client';

export default function WhyPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Why ConnectNetwork?</span></h1>
	  <p className="section-subtitle mt-2">Clarity, transparency and a product-first philosophy.</p>
	  <WhyClient />
	</div>
  )
}
