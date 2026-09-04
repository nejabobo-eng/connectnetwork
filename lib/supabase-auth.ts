import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const store = cookies()
  return createServerClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
    cookies: { getAll: () => store.getAll(), setAll: values => values.forEach(({ name, value, options }) => store.set(name, value, options)) }
  })
}
