const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasDatabaseConfiguration = () => Boolean(url && key)

export async function insertAdminRecord(table: string, record: Record<string, unknown>) {
  if (!url || !key) throw new Error('Database is not configured')
  const response = await fetch(`${url}/rest/v1/${table}`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(record), cache: 'no-store' })
  if (!response.ok) throw new Error(`Database request failed: ${response.status} ${await response.text()}`)
  return response.json() as Promise<Array<Record<string, unknown>>>
}

export async function adminRequest(path: string, init: RequestInit = {}) {
  if (!url || !key) throw new Error('Database is not configured')
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers || {}) }, cache: 'no-store' })
  if (!response.ok) throw new Error(`Database request failed: ${response.status} ${await response.text()}`)
  return response.status === 204 ? null : response.json()
}
