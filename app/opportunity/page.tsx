export const metadata = { title: 'Distribution Opportunity — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/opportunity' } } as const
import OpportunityClient from './Client'

export default function OpportunityPage(){
  return (
	<div className="container-section py-16">
		<h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Distribution Opportunity</span></h1>
	  <p className="section-subtitle mt-2">A simple, optional path to earn referral commissions.</p>
	  <OpportunityClient />
	</div>
  )
}
