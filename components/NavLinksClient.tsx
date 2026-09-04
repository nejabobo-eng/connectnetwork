"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinksClient(){
  const pathname = usePathname()
	const links = [
	{href:'/',label:'Home'},
	{href:'/products',label:'Shop'},
	{href:'/about',label:'About'},
	{href:'/suppliers',label:'Become a Supplier'},
	{href:'/faq',label:'FAQ'},
	{href:'/account',label:'Sign in'},
	{href:'/cart',label:'Cart'},
  ]
  return (
	<>
	  {links.map(l=>{
		const active = pathname === l.href
		return (
		  <Link key={l.href} href={l.href} className={`nav-link hover:text-primary ${active? 'text-primary font-semibold' : ''}`} aria-current={active? 'page' : undefined}>{l.label}</Link>
		)
	  })}
	  <Link href="/products" className="btn btn-primary text-white">Shop Now</Link>
	</>
  )
}
