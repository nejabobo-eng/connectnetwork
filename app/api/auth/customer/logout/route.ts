import { NextResponse } from 'next/server'
import { customerCookieName } from '@/lib/customer-auth'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export async function POST(request: Request) {
  await createSupabaseServerClient().auth.signOut()
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete(customerCookieName)
  return response
}
