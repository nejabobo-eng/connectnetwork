"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinksClient(){
  const pathname = usePathname()
  const links = [
	{href:'/about',label:'About'},
	{href:'/products',label:'Products'},
	{href:'/opportunity',label:'Become a Distributor'},
	{href:'/compensation',label:'Distributor Rewards'},
	{href:'/delivery',label:'Delivery'},
	{href:'/faq',label:'FAQ'},
	{href:'/why',label:'Why'},
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
