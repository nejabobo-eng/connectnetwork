export const metadata = { title: 'How It Works — ConnectNetwork', description: 'How the ConnectNetwork business promotion service works. Simple 4-step process to get your business promoted.', alternates: { canonical: 'https://connectnetwork.co.za/how-it-works' } } as const

import HowItWorksClient from './Client'

export default function HowItWorksPage(){
  return <HowItWorksClient />
}
