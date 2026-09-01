import { NextResponse } from 'next/server'

export async function GET() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY', 'YOCO_SECRET_KEY']
  const missing = required.filter(name => !process.env[name])
  return NextResponse.json({ status: missing.length ? 'degraded' : 'ok', missing }, { status: missing.length ? 503 : 200 })
}
