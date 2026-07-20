import FAQClient from './Client'
export const metadata = { title: 'FAQ — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/faq' } } as const

export default function FAQPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title">Frequently Asked Questions</h1>
	  <FAQClient />

	  <section className="mt-10">
		<h2 className="text-xl font-semibold">Our Business Model</h2>
		<ul className="list-disc pl-6 mt-3 text-gray-700 space-y-1">
		  <li>Every package includes real products.</li>
		  <li>Referral rewards are linked to qualifying product purchases.</li>
		  <li>Participation as a distributor is optional.</li>
		  <li>Products are delivered according to the published delivery policy.</li>
		  <li>ConnectNetwork works with suppliers to distribute products to customers.</li>
		</ul>
	  </section>

	  <p className="text-xs text-gray-500 mt-8">
		ConnectNetwork reserves the right to update its products, pricing, Distributor Rewards Plan, and operating policies from time to time. The latest versions published by ConnectNetwork will apply.
	  </p>
	</div>
  )
}
