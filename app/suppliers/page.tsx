export const metadata = { title: 'Suppliers — ConnectNetwork', alternates: { canonical: 'https://connectnetwork.co.za/suppliers' } } as const
import SuppliersClient from './Client'

export default function SuppliersPage(){
  return <SuppliersClient />
}
