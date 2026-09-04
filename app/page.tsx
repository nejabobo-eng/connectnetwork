export const metadata = { title: 'ConnectNetwork — Shop products from trusted suppliers', alternates: { canonical: 'https://connectnetwork.co.za/' }, description: 'Discover products from approved suppliers, shop securely, and support growing businesses through ConnectNetwork.' } as const

import HomeClient from '@/components/pages/HomeClient'

export default function HomePage() {
  return <HomeClient />
}
