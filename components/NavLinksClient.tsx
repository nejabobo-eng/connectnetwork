"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinksClient(){
  const pathname = usePathname()
  const links = [
	{href:'/',label:'Home'},
	{href:'/products',label:'What We Promote'},
	{href:'/why',label:'Why ConnectNetwork'},
	{href:'/promotion',label:'How We Promote'},
	{href:'/suppliers',label:'Become a Supplier'},
	{href:'/about',label:'About'},
	{href:'/faq',label:'FAQ'},
  ]
  return (
	<>
	  {links.map(l=>{
		const active = pathname === l.href
		return (
		  <Link key={l.href} href={l.href} className={`nav-link hover:text-primary ${active? 'text-primary font-semibold' : ''}`} aria-current={active? 'page' : undefined}>{l.label}</Link>
		)
	  })}
	  <Link href="/contact" className="btn btn-primary text-white">Promote My Business</Link>
	</>
  )
}
