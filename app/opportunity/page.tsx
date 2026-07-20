export const metadata = { title: 'Become a Distributor — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/opportunity' } } as const
import OpportunityClient from './Client'

export default function OpportunityPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Become a Distributor</span></h1>
	  <p className="section-subtitle mt-2">Customers may choose to register as independent distributors and participate in our referral programme.</p>
	  <OpportunityClient />
	</div>
  )
}
