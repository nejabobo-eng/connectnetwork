import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { customerCookieName } from '@/lib/customer-auth'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url), { status: 303 })
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: values => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    })
    await supabase.auth.signOut()
  }
  response.cookies.delete(customerCookieName)
  return response
}
