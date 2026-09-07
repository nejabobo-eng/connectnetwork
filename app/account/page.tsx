import AccountClient from './AccountClient'
import { cookies } from 'next/headers'
import { customerCookieName, getCustomerEmail } from '@/lib/customer-auth'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export const metadata = { title: 'My account — ConnectNetwork', robots: { index: false, follow: false } }

export default async function AccountPage() {
  const customerEmail = getCustomerEmail(cookies().get(customerCookieName)?.value)

  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    return <AccountClient email={user?.email || customerEmail || undefined} />
  } catch {
    return <AccountClient email={customerEmail || undefined} />
  }
}
