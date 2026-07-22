import './globals.css'
import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Suspense } from 'react'
import NavLinksClient from '@/components/NavLinksClient'

const poppins = Poppins({ subsets: ['latin'], weight: ['600','700','800'] })
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ConnectNetwork — Connecting Products. Connecting People.',
  description: 'South African distribution network connecting quality household products with customers through independent distributors.',
  openGraph: {
	title: 'ConnectNetwork — Connecting Products. Connecting People.',
	description: 'South African distribution network connecting quality household products with customers through independent distributors.',
	url: 'https://connectnetwork.co.za',
	siteName: 'ConnectNetwork',
	type: 'website'
  },
  twitter: {
	card: 'summary_large_image',
	title: 'ConnectNetwork',
	description: 'Connecting Products. Connecting People.'
  },
  metadataBase: new URL('https://connectnetwork.co.za')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
	<html lang="en">
		<body className={`${inter.className}`}>
		<Header poppinsClass={poppins.className} />
		{/* JSON-LD Organization schema */}
		<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
		  '@context': 'https://schema.org',
		  '@type': 'Organization',
		  name: 'ConnectNetwork',
		  url: 'https://connectnetwork.co.za',
		  email: 'info@connectnetwork.co.za',
			logo: 'https://connectnetwork.co.za/logo/logo.jpg',
		  sameAs: []
		}) }} />
		<main className="pt-16 transition-opacity duration-200" id="main">
		  {children}
		</main>
		<footer className="mt-24 border-t relative overflow-hidden">
		  {/* network pattern background */}
		  <NetworkBackground subtle />
			<div className="container-section grid md:grid-cols-4 gap-8 py-12 text-sm relative">
			<div>
			  <div className={`text-primary font-bold text-lg mb-2 ${poppins.className}`}>ConnectNetwork</div>
				<p className="text-gray-600">Quality Products • Trusted Distribution • Growing Together</p>
			</div>
			<div>
				<div className="font-semibold mb-3">Company</div>
			  <ul className="space-y-2 text-gray-600">
				<li><Link href="/about">About</Link></li>
				<li><Link href="/products">Products</Link></li>
				<li><Link href="/opportunity">Opportunity</Link></li>
				  <li><Link href="/why">Why ConnectNetwork?</Link></li>
			  </ul>
			</div>
			<div>
			  <div className="font-semibold mb-3">Legal</div>
				<ul className="space-y-2 text-gray-600">
				<li><Link href="/legal/terms">Terms & Conditions</Link></li>
				<li><Link href="/legal/privacy">Privacy Policy</Link></li>
				<li><Link href="/legal/disclaimer">Disclaimer</Link></li>
				<li><Link href="/legal/cookies">Cookie Notice</Link></li>
			  </ul>
			</div>
			<div>
			  <div className="font-semibold mb-3">Contact</div>
			  <ul className="space-y-2 text-gray-600">
				<li><a href="mailto:info@connectnetwork.co.za">info@connectnetwork.co.za</a></li>
				<li><a href="https://wa.me/27745513626?text=Hello%20ConnectNetwork.%20I%20would%20like%20to%20learn%20more%20about%20your%20products%20and%20distributor%20opportunity." target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a></li>
			  </ul>
			</div>
		  </div>
		  <div className="border-t py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} ConnectNetwork. All rights reserved.</div>
		</footer>
	  </body>
	</html>
  )
}

function Header({poppinsClass}:{poppinsClass:string}){
  return (
	<header className="fixed inset-x-0 top-0 z-50 transition bg-transparent data-[scrolled=true]:glass border-b border-transparent data-[scrolled=true]:border-gray-200">
		<div className="container-section flex h-20 items-center justify-between">
		<Link href="/" className={`text-primary font-bold text-lg ${poppinsClass} flex items-center gap-2`} aria-label="ConnectNetwork Home">
		  <img src="/logo/logo.jpg" alt="ConnectNetwork" className="h-10 md:h-12 w-auto" />
		  <span className="sr-only">ConnectNetwork</span>
		</Link>
		<nav className="hidden md:flex gap-6 text-sm" aria-label="Main Navigation">
		  <NavLinksClient />
		</nav>
		<MobileMenu poppinsClass={poppinsClass} />
	  </div>
	  <script dangerouslySetInnerHTML={{__html:`
		const header=document.querySelector('header');
		const onScroll=()=>{ if(!header) return; const y=window.scrollY; header.setAttribute('data-scrolled', String(y>4)); };
		window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
		  // simple page fade on navigation
		if (typeof window !== 'undefined') {
		  const main = document.getElementById('main');
		  document.addEventListener('visibilitychange',()=>{
			if(!main) return; main.style.opacity = document.visibilityState==='hidden'? '0.98' : '1';
		  });
		}
	  `}} />
	</header>
  )
}

// server-only NavLink removed in favor of client component with usePathname

function MobileMenu({poppinsClass}:{poppinsClass:string}){
  return (
	<details className="md:hidden">
	  <summary className="list-none p-2 rounded-lg hover:bg-gray-100 cursor-pointer" aria-label="Open menu">
		<Menu aria-hidden className="h-6 w-6" />
	  </summary>
	  <div className="absolute right-4 mt-2 w-60 card p-3">
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/about">About</a>
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/products">Products</a>
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/opportunity">Opportunity</a>
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/compensation">Compensation</a>
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/delivery">Delivery</a>
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/faq">FAQ</a>
		<a className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/why">Why</a>
		<a className="block px-3 py-2 rounded-full btn btn-primary mt-2 text-center" href="/contact">Contact</a>
	  </div>
	</details>
  )
}

function NetworkBackground({subtle=false}:{subtle?:boolean}){
  return (
	<svg aria-hidden className={`absolute inset-0 w-full h-full ${subtle? 'opacity-20' : 'opacity-30'}`}>
	  <defs>
		<linearGradient id="nbg" x1="0" y1="0" x2="1" y2="1">
		  <stop offset="0%" stopColor="#0A4D8C" stopOpacity="0.25" />
		  <stop offset="100%" stopColor="#2E8B57" stopOpacity="0.25" />
		</linearGradient>
	  </defs>
	  {Array.from({length:18}).map((_,i)=> (
		<circle key={`c-${i}`} cx={(i*120)%1400} cy={(i*70)%500} r={3} fill="url(#nbg)">
		  <animate attributeName="r" values="3;4;3" dur="6s" begin={`${i*0.3}s`} repeatCount="indefinite" />
		</circle>
	  ))}
	  {Array.from({length:12}).map((_,i)=> (
		<path key={`p-${i}`} d={`M ${(i*140)%1200} ${(i*60)%500} C ${(i*140)%1200+60} ${(i*60)%500-20}, ${(i*140)%1200+80} ${(i*60)%500+20}, ${(i*140)%1200+160} ${(i*60)%500}`} stroke="url(#nbg)" strokeWidth="1" fill="none">
		  <animate attributeName="stroke-opacity" values="0.2;0.4;0.2" dur="7s" begin={`${i*0.4}s`} repeatCount="indefinite" />
		</path>
	  ))}
	</svg>
  )
}
