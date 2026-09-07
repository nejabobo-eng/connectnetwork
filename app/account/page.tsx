import AccountClient from './AccountClient'
import { cookies } from 'next/headers'
import { customerCookieName, getCustomerEmail } from '@/lib/customer-auth'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export const metadata = { title: 'My account — ConnectNetwork', robots: { index: false, follow: false } }

export default async function AccountPage({ searchParams }: { searchParams?: { error?: string } }) {
  const customerEmail = getCustomerEmail(cookies().get(customerCookieName)?.value)

  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    const metadata = user?.user_metadata || {}
    return <AccountClient email={user?.email || customerEmail || undefined} firstName={metadata.first_name || metadata.given_name} lastName={metadata.last_name || metadata.family_name} fullName={metadata.full_name || metadata.name} authError={searchParams?.error} />
  } catch {
    return <AccountClient email={customerEmail || undefined} authError={searchParams?.error} />
  }
}
