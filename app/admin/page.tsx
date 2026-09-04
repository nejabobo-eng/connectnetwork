import { redirect } from 'next/navigation'
export const metadata = { title: 'Admin Review | ConnectNetwork', robots: { index: false, follow: false } }
export default function AdminPage() { redirect(process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3001') }
