import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { cookieName, isValidAdminSession } from '@/lib/admin-auth'
import { insertAdminRecord } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  if (!isValidAdminSession(cookies().get(cookieName)?.value)) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const { demandSignal } = await request.json().catch(() => ({}))
  if (typeof demandSignal !== 'string' || demandSignal.trim().length < 10) return NextResponse.json({ error: 'Describe the customer demand in at least 10 characters.' }, { status: 400 })
  const task = (await insertAdminRecord('ai_tasks', { task_type: 'discover_product_opportunity', payload: { demand_signal: demandSignal.trim().slice(0, 2000) } }))[0]
  await insertAdminRecord('ai_events', { task_id: task.id, event_type: 'discovery_task_queued', actor: 'admin', payload: { demand_signal: demandSignal.trim().slice(0, 2000) } })
  return NextResponse.json({ id: task.id }, { status: 201 })
}
