'use client'

import { FormEvent, useState } from 'react'

type AccountClientProps = {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  authError?: string
}

export default function AccountClient({ email, firstName, lastName, fullName, authError }: AccountClientProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [message, setMessage] = useState(authError === 'signin' ? 'Google sign-in could not be completed. Please try again.' : '')
  const displayName = firstName || fullName?.split(' ')[0] || ''

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Please wait…')
    try {
      const response = await fetch('/api/auth/customer/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(event.currentTarget)), mode }) })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.ok) { window.location.reload(); return }
      setMessage(data.message || data.error || 'We could not complete your request.')
    } catch { setMessage('The sign-in service could not be reached. Please try again.') }
  }

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Saving your details…')
    try {
      const response = await fetch('/api/auth/customer/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) })
      const data = await response.json().catch(() => ({}))
      if (response.ok) { window.location.reload(); return }
      setMessage(data.error || 'Your details could not be saved.')
    } catch { setMessage('Your details could not be saved. Please try again.') }
  }

  if (email) return <main className="container-section py-16"><section className="mx-auto max-w-xl rounded-3xl border bg-white p-8 shadow-sm"><p className="font-semibold text-green">MY ACCOUNT</p><h1 className="mt-2 text-3xl font-bold">{displayName ? `Welcome, ${displayName}` : 'Welcome to ConnectNetwork'}</h1><p className="mt-4 text-slate-600">Signed in as <strong>{email}</strong>. Keep your details up to date to receive order updates.</p><form className="mt-7 grid gap-4 border-t pt-7" onSubmit={updateProfile}><h2 className="text-lg font-bold">Your details</h2><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">First name<input required name="firstName" defaultValue={firstName || ''} className="rounded-lg border p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Surname<input required name="lastName" defaultValue={lastName || ''} className="rounded-lg border p-3 font-normal" /></label></div><button className="btn btn-primary justify-self-start" type="submit">Save details</button></form>{message && <p className="mt-4 text-sm text-slate-600" role="status">{message}</p>}<form action="/api/auth/customer/logout" method="post"><button className="btn btn-ghost mt-7">Sign out</button></form></section></main>

  return <main className="container-section py-16"><section className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm"><p className="font-semibold text-green">CONNECTNETWORK ACCOUNT</p><h1 className="mt-2 text-3xl font-bold">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-3 text-slate-600">Sign in to save products, track orders, and complete checkout securely.</p><a className="btn btn-primary mt-6 w-full" href="/api/auth/customer/google">Continue with Google</a><div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-200" />OR CONTINUE WITH EMAIL<span className="h-px flex-1 bg-slate-200" /></div><form className="grid gap-4" onSubmit={submit}>{mode === 'sign-up' && <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">First name<input required name="firstName" autoComplete="given-name" className="rounded-lg border p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Surname<input required name="lastName" autoComplete="family-name" className="rounded-lg border p-3 font-normal" /></label></div>}<label className="grid gap-2 text-sm font-semibold">Email<input required name="email" type="email" autoComplete="email" className="rounded-lg border p-3 font-normal" /></label><label className="grid gap-2 text-sm font-semibold">Password<input required name="password" type="password" minLength={8} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} className="rounded-lg border p-3 font-normal" /></label><button className="btn btn-primary w-full" type="submit">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form>{message && <p className="mt-4 text-sm text-slate-600" role="status">{message}</p>}<button className="mt-6 text-sm font-semibold text-primary hover:underline" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage('') }}>{mode === 'sign-in' ? 'New to ConnectNetwork? Create an account' : 'Already have an account? Sign in'}</button></section></main>
}
