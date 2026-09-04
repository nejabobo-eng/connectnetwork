import { NextResponse } from 'next/server'
import { verifyMarketplacePayment } from '@/lib/marketplace-payment'

export async function GET(request: Request) {
  const paymentId = new URL(request.url).searchParams.get('paymentId')
  if (!paymentId) return NextResponse.json({ error: 'A payment reference is required.' }, { status: 400 })

  try {
    const result = await verifyMarketplacePayment(paymentId)
    return NextResponse.json({ status: result.paid ? 'succeeded' : 'pending' })
  } catch {
    return NextResponse.json({ status: 'pending' })
  }
}
