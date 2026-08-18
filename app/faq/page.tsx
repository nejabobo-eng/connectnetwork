import FAQClient from './Client'
export const metadata = { title: 'FAQ — ConnectNetwork Business Promotion Service', description: 'Frequently asked questions about ConnectNetwork promotion service. How it works, pricing, channels, and more.', alternates: { canonical: 'https://connectnetwork.co.za/faq' } } as const

export default function FAQPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Frequently Asked Questions</span></h1>
	  <FAQClient />

	  <section className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
		<h2 className="text-lg font-semibold text-blue-900 mb-3">About ConnectNetwork Promotion Service</h2>
		<p className="text-sm text-blue-800 leading-relaxed">
		  ConnectNetwork is a business promotion and marketing service. We help businesses get noticed by promoting their offerings through our network, audience and marketing capabilities. ConnectNetwork handles the promotion. Your business operates independently.
		</p>
	  </section>

	  <p className="text-xs text-gray-500 mt-8">
		ConnectNetwork reserves the right to update its services, packages, pricing, and operating policies from time to time. The latest versions published by ConnectNetwork will apply.
	  </p>
	</div>
  )
}
