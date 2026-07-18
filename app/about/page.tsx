export const metadata = { title: 'About — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/about' } } as const
import AboutClient from './Client'

export default function AboutPage(){
  return (
	<div>
	  <AboutClient />

	  <section className="bg-gray-50">
		<div className="container-section py-16 grid md:grid-cols-3 gap-6">
		  {[{t:'Mission',d:'To connect households with quality everyday products through a trusted distribution network.'},{t:'Vision',d:'To empower communities with access to products and opportunities to earn supplementary income.'},{t:'Values',d:'Integrity, transparency, and community-focused growth.'}].map((c,i)=> (
			<div className="card p-6 hover:-translate-y-0.5 hover:shadow-lg transition" key={i}>
			  <div className="font-semibold text-lg">{c.t}</div>
			  <div className="text-gray-600 mt-2">{c.d}</div>
			</div>
		  ))}
		</div>
	  </section>

	  <section className="container-section py-16 grid md:grid-cols-2 gap-6">
		<div className="card p-6 hover:-translate-y-0.5 hover:shadow-lg transition">
		  <h2 className="font-semibold text-xl">How it Works (English)</h2>
		  <ol className="mt-3 list-decimal pl-5 space-y-2 text-gray-700">
			<li>Purchase the ConnectNetwork Starter Pack.</li>
			<li>Receive your cleaning products.</li>
			<li>Use them or recommend them to others.</li>
			<li>Earn commission for qualifying referrals if you choose to become a distributor.</li>
		  </ol>
		</div>
		<div className="card p-6 hover:-translate-y-0.5 hover:shadow-lg transition">
		  <h2 className="font-semibold text-xl">Indlela Esebenza Ngayo (isiZulu)</h2>
		  <ol className="mt-3 list-decimal pl-5 space-y-2 text-gray-700">
			<li>Thenga i-Starter Pack ye-ConnectNetwork.</li>
			<li>Uzothola imikhiqizo yokuhlanza.</li>
			<li>Yisebenzise noma uyeluleke kwabanye.</li>
			<li>Thola ikomishini uma ubhekise amakhasimende afanele futhi ukhetha ukuba umthengisi ozimele.</li>
		  </ol>
		</div>
	  </section>
	</div>
  )
}
