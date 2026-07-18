export const metadata = { title: 'Compensation — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/compensation' } } as const
import CompensationClient from './Client'

export default function CompensationPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Compensation Plan</span></h1>
	  <p className="section-subtitle mt-2">Simple, transparent and easy to understand.</p>
		<CompensationClient />
	</div>
  )
}
