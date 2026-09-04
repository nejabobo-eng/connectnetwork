import { NextResponse } from 'next/server'
import { verifyMarketplacePayment } from '@/lib/marketplace-payment'

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

export async function GET(request: Request) {
  const redirect = new URL('/cart', request.url)
  const paymentId = new URL(request.url).searchParams.get('paymentId')
  if (!paymentId) { redirect.searchParams.set('payment', 'invalid'); return NextResponse.redirect(redirect) }
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const result = await verifyMarketplacePayment(paymentId)
      if (result.paid) {
        redirect.searchParams.set('payment', 'success')
        return NextResponse.redirect(redirect)
      }
      await wait(1500)
    }
    redirect.searchParams.set('payment', 'pending')
    redirect.searchParams.set('paymentId', paymentId)
  } catch { redirect.searchParams.set('payment', 'verification_failed') }
  return NextResponse.redirect(redirect)
}
