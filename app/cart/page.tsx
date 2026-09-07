import CartClient from './CartClient'
import { createSupabaseServerClient } from '@/lib/supabase-auth'

export const metadata = { title: 'Your cart — ConnectNetwork' }

export default async function CartPage() {
  try {
    const { data: { user } } = await createSupabaseServerClient().auth.getUser()
    return <CartClient email={user?.email} />
  } catch {
    return <CartClient />
  }
}
