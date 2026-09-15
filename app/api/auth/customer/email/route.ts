import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : ''
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const mode = body.mode === 'sign-up' ? 'sign-up' : 'sign-in'
  if (!email || password.length < 8) return NextResponse.json({ error: 'Enter a valid email address and a password of at least 8 characters.' }, { status: 400 })
  if (mode === 'sign-up' && (!firstName || !lastName || phone.length < 8)) return NextResponse.json({ error: 'Enter your first name, surname, and phone number to create an account.' }, { status: 400 })
  if (mode === 'sign-up' && password !== confirmPassword) return NextResponse.json({ error: 'Your passwords do not match.' }, { status: 400 })
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ error: 'Account sign-in is not configured.' }, { status: 503 })
  const supabase = createSupabaseServerClient()
  const emailRedirectTo = new URL('/account', request.url).toString()
  const { data, error } = mode === 'sign-up'
    ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo, data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, phone } } })
    : await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data.session ? { ok: true } : { message: 'Check your email to confirm your account, then sign in.' })
}
