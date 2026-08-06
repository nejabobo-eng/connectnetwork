"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinksClient(){
  const pathname = usePathname()
  const links = [
	{href:'/products',label:'Products'},
	{href:'/#distributor-registration',label:'Become a Distributor'},
	{href:'/#how-it-works',label:'How It Works'},
	{href:'/#commission',label:'Commission'},
	{href:'/about',label:'About'},
  ]
  return (
	<>
	  {links.map(l=>{
		const active = pathname === l.href
		return (
		  <Link key={l.href} href={l.href} className={`nav-link hover:text-primary ${active? 'text-primary font-semibold' : ''}`} aria-current={active? 'page' : undefined}>{l.label}</Link>
		)
	  })}
	  <Link href="/contact" className="btn btn-primary text-white">Contact</Link>
	</>
  )
}
