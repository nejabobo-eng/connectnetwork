import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = new URL('/account', request.url)
  if (!code) { redirect.searchParams.set('error', 'signin'); return NextResponse.redirect(redirect) }
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) { redirect.searchParams.set('error', 'signin'); return NextResponse.redirect(redirect) }
  try {
    const response = NextResponse.redirect(redirect)
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: values => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    return response
  } catch { redirect.searchParams.set('error', 'signin'); return NextResponse.redirect(redirect) }
}
