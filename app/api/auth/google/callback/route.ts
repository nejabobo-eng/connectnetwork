import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cookieName, createAdminSession } from '@/lib/admin-auth'

export async function GET(request: Request) {
  const currentUrl = new URL(request.url)
  const code = currentUrl.searchParams.get('code')
  const state = currentUrl.searchParams.get('state')
  const expectedState = cookies().get('connectnetwork_oauth_state')?.value
  const verifier = cookies().get('connectnetwork_pkce_verifier')?.value
  const appUrl = new URL('/admin', request.url)
  if (!code || !state || !verifier || state !== expectedState) { appUrl.searchParams.set('error', 'Google sign-in could not be verified.'); return NextResponse.redirect(appUrl) }
  try {
    const tokenResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=pkce`, { method: 'POST', headers: { apikey: process.env.SUPABASE_ANON_KEY || '', 'Content-Type': 'application/json' }, body: JSON.stringify({ auth_code: code, code_verifier: state }), cache: 'no-store' })
    if (!tokenResponse.ok) throw new Error('Token exchange failed')
    const tokens = await tokenResponse.json()
    const userResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY || '', Authorization: `Bearer ${tokens.access_token}` }, cache: 'no-store' })
    const user = await userResponse.json()
    if (!userResponse.ok || user.email?.toLowerCase() !== (process.env.ADMIN_EMAIL || 'nejabobo@gmail.com').toLowerCase()) throw new Error('This Google account is not allowed')
    const response = NextResponse.redirect(appUrl)
    response.cookies.set(cookieName, createAdminSession(user.email), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 })
    response.cookies.delete('connectnetwork_oauth_state')
    response.cookies.delete('connectnetwork_pkce_verifier')
    return response
  } catch { appUrl.searchParams.set('error', 'This Google account is not authorised.'); return NextResponse.redirect(appUrl) }
}
