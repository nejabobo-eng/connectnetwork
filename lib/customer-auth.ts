import { createHmac, timingSafeEqual } from 'crypto'

export const customerCookieName = 'connectnetwork_customer'
const secret = process.env.CUSTOMER_SESSION_SECRET

export function createCustomerSession(email: string) {
  if (!secret) throw new Error('CUSTOMER_SESSION_SECRET is not configured')
  const normalisedEmail = email.toLowerCase()
  return `${normalisedEmail}.${createHmac('sha256', secret).update(normalisedEmail).digest('hex')}`
}

export function getCustomerEmail(value?: string) {
  if (!value || !secret) return null
  const [email] = value.split('.')
  if (!email) return null
  const expected = createCustomerSession(email)
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected)) ? email : null
}
