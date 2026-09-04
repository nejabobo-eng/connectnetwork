'use client'

import { FormEvent, useState } from 'react'

export default function AccountClient({ email }: { email?: string | null }) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Please wait…')
    try {
      const response = await fetch('/api/auth/customer/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(event.currentTarget)), mode }) })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.ok) { window.location.reload(); return }
      setMessage(data.message || data.error || 'We could not complete your request.')
    } catch { setMessage('The sign-in service could not be reached. Restart the public site and try again.') }
  }
  if (email) return <main className="container-section py-16"><section className="mx-auto max-w-xl rounded-3xl border bg-white p-8 shadow-sm"><p className="font-semibold text-green">MY ACCOUNT</p><h1 className="mt-2 text-3xl font-bold">You are signed in</h1><p className="mt-4 text-slate-600">Signed in as <strong>{email}</strong>. Your orders and saved products will appear here as the marketplace goes live.</p><form action="/api/auth/customer/logout" method="post"><button className="btn btn-ghost mt-7">Sign out</button></form></section></main>
  return <main className="container-section py-16"><section className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm"><p className="font-semibold text-green">CONNECTNETWORK ACCOUNT</p><h1 className="mt-2 text-3xl font-bold">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-3 text-slate-600">Sign in to save products, track orders, and check out faster.</p><a className="btn btn-primary mt-6 w-full" href="/api/auth/customer/google">Continue with Google</a><div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-200" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-slate-200" /></div><form className="grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm font-semibold">Email<input required name="email" type="email" autoComplete="email" className="rounded-lg border p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Password<input required name="password" type="password" minLength={8} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} className="rounded-lg border p-3 font-normal" /></label><button className="btn btn-primary w-full" type="submit">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form>{message && <p className="mt-4 text-sm text-slate-600" role="status">{message}</p>}<button className="mt-6 text-sm font-semibold text-primary hover:underline" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage('') }}>{mode === 'sign-in' ? 'New to ConnectNetwork? Create an account' : 'Already have an account? Sign in'}</button></section></main>
}
