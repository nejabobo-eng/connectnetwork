export const metadata = { title: 'Promote My Business — ConnectNetwork', description: 'Contact ConnectNetwork to promote your business, products or services. Affordable monthly promotion packages available.', alternates: { canonical: 'https://connectnetwork.co.za/contact' } } as const
import ContactClient from './Client'

export default function ContactPage(){
  return (
	<div className="container-section py-16">
	  <div className="max-w-2xl mx-auto">
		<h1 className="section-title text-center"><span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Ready to Promote Your Business?</span></h1>
		<p className="section-subtitle mt-4 text-center">Tell us what you want to promote and we'll discuss the available promotion options and pricing with you.</p>

		<div className="mt-12">
		  <ContactClient />
		</div>
	  </div>
	</div>
  )
}
