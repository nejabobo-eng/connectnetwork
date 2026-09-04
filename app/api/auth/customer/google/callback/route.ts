import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createCustomerSession, customerCookieName } from '@/lib/customer-auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const verifier = cookies().get('connectnetwork_customer_pkce_verifier')?.value
  const redirect = new URL('/account', request.url)
  if (!code || !verifier) { redirect.searchParams.set('error', 'signin'); return NextResponse.redirect(redirect) }
  try {
    const tokenResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=pkce`, { method: 'POST', headers: { apikey: process.env.SUPABASE_ANON_KEY || '', 'Content-Type': 'application/json' }, body: JSON.stringify({ auth_code: code, code_verifier: verifier }), cache: 'no-store' })
    if (!tokenResponse.ok) throw new Error('Token exchange failed')
    const tokens = await tokenResponse.json()
    const email = tokens.user?.email
    if (typeof email !== 'string') throw new Error('Google did not return an email address')
    const response = NextResponse.redirect(redirect)
    response.cookies.set(customerCookieName, createCustomerSession(email), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 14 })
    response.cookies.delete('connectnetwork_customer_pkce_verifier')
    return response
  } catch { redirect.searchParams.set('error', 'signin'); return NextResponse.redirect(redirect) }
}
