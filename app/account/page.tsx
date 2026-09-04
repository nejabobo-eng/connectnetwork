import AccountClient from './AccountClient'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export const metadata = { title: 'My account — ConnectNetwork', robots: { index: false, follow: false } }

export default async function AccountPage() {
  const { data: { user } } = await createSupabaseServerClient().auth.getUser()
  return <AccountClient email={user?.email} />
}
