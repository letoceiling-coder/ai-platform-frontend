import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../shared/config/api'
import { useAuthStore } from '../store/auth.store'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const token = res?.data?.token
      if (typeof token !== 'string' || !token) {
        throw new Error('Invalid login response')
      }
      setAuth(token, res?.data?.user ?? null)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError('Login failed. Check credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">Login</h1>
        <p className="mt-1 text-sm text-slate-300">Sign in to continue.</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            label="Email"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? <div className="text-sm text-rose-300">{error}</div> : null}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}
