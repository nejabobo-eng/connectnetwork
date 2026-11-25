import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'ConnectNetwork — Coming Soon', description: 'Coming soon.', metadataBase: new URL('https://connectnetwork.co.za') }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{margin:0}}>{children}</body></html>
}
