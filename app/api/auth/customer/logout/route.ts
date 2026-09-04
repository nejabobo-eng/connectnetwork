import { NextResponse } from 'next/server'
import { customerCookieName } from '@/lib/customer-auth'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete(customerCookieName)
  return response
}
