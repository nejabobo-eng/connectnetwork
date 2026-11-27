import { NextRequest, NextResponse } from 'next/server'
export function middleware(request:NextRequest){
 const path=request.nextUrl.pathname
 if(path==='/'||path==='/demand'||path==='/enquiry'||path==='/stakeholder'||path==='/api/stakeholder'||path==='/api/enquiry'||path==='/supplier-register'||path==='/supplier-dashboard'||path==='/marketplace'||path==='/intelligence'||path==='/api/intelligence'||path==='/logo/logo.jpg'||path.startsWith('/_next/static/')||path==='/api/control')return NextResponse.next()
 if(path==='/api'||path.startsWith('/api/')||!['GET','HEAD'].includes(request.method))return new NextResponse('Not available',{status:404})
 return NextResponse.redirect(new URL('/',request.url),307)
}
export const config={matcher:['/((?!_next/static/).*)']}
