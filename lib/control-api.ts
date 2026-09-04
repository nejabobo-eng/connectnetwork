import { timingSafeEqual } from 'crypto'

export function hasControlApiAccess(request: Request) {
  const expected = process.env.CONNECTNETWORK_ADMIN_API_KEY
  const supplied = request.headers.get('x-connectnetwork-admin-key')
  if (!expected || !supplied || expected.length !== supplied.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))
}
