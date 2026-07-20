export const metadata = { title: 'Contact — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/contact' } } as const
import ContactClient from './Client'

export default function ContactPage(){
  return (
	<div className="container-section py-16">
	  <h1 className="section-title">Contact</h1>
	  <p className="section-subtitle mt-2">We would love to hear from you.</p>

		<div className="grid md:grid-cols-2 gap-10 mt-8 items-start">
		<ContactClient />

		<div className="card p-6 space-y-3 text-sm text-gray-700">
		  <div><strong>Email:</strong> info@connectnetwork.co.za</div>
		  <div><strong>Phone (WhatsApp):</strong> <a href="https://wa.me/27745513626" target="_blank" rel="noopener noreferrer">+27 74 551 3626</a></div>
		  <div><strong>Website:</strong> connectnetwork.co.za</div>
		</div>
	  </div>
	</div>
  )
}
