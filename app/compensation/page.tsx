export const metadata = { title: 'Distributor Rewards — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/compensation' } } as const
import CompensationClient from './Client'

export default function CompensationPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Distributor Rewards</span></h1>
	  <p className="section-subtitle mt-2">Registered distributors who introduce new customers may become eligible for referral rewards according to the current Compensation Plan.</p>
		<CompensationClient />
	</div>
  )
}
