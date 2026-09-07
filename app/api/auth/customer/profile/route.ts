import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}))
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
  if (!firstName || !lastName) return NextResponse.json({ error: 'Enter both your first name and surname.' }, { status: 400 })

  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in before updating your account.' }, { status: 401 })

  const { error } = await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
