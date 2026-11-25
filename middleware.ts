import { NextRequest, NextResponse } from 'next/server'
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path === '/' || path === '/logo/logo.jpg' || path.startsWith('/_next/static/')) return NextResponse.next()
  if (request.method !== 'GET' && request.method !== 'HEAD' || path === '/api' || path.startsWith('/api/')) return new NextResponse('Not available', { status: 404 })
  return NextResponse.redirect(new URL('/', request.url), 307)
}
export const config = { matcher: ['/((?!_next/static/).*)'] }
