export const metadata = { title: 'Delivery — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/delivery' } } as const
import DeliveryClient from './Client'

export default function DeliveryPage(){
  return (
	<div className="container-section py-16">
		<h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Delivery</span></h1>
	  <p className="section-subtitle mt-2">Orders are fulfilled through our supplier and logistics partners. Delivery times vary by location.</p>
	  <DeliveryClient />
	</div>
  )
}
