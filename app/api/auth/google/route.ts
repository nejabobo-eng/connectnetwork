import { createHash, randomBytes, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 })
  const state = randomUUID()
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const response = NextResponse.redirect(`${url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(new URL('/api/auth/google/callback', request.url).toString())}&state=${state}&code_challenge=${challenge}&code_challenge_method=s256`)
  response.cookies.set('connectnetwork_oauth_state', state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 600 })
  response.cookies.set('connectnetwork_pkce_verifier', verifier, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 600 })
  return response
}
