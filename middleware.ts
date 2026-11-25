import { NextRequest, NextResponse } from 'next/server'
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url), 307)
}
export const config = { matcher: ['/((?!$|api(?:/|$)|_next(?:/|$)|logo(?:/|$)|favicon.ico|robots.txt|sitemap.xml).*)'] }
