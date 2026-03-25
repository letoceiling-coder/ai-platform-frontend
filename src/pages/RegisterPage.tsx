import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../shared/config/api'
import { useAuthStore } from '../store/auth.store'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'
import { useToastStore } from '../store/toast.store'

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const toast = useToastStore((s) => s.push)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast({ type: 'error', title: 'Пароль должен быть не короче 6 символов' })
      return
    }
    if (password !== confirm) {
      toast({ type: 'error', title: 'Пароли не совпадают' })
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/auth/register', { email, password })
      const loginRes = await api.post('/auth/login', { email, password })
      const token = loginRes?.data?.access_token
      if (typeof token !== 'string' || !token) {
        throw new Error('Invalid login after register')
      }
      localStorage.setItem('token', token)
      setAuth(token, loginRes?.data?.user ?? null)
      navigate('/dashboard', { replace: true })
    } catch {
      toast({ type: 'error', title: 'Ошибка регистрации' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-300">Создайте аккаунт для доступа к платформе.</p>

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
            label="Пароль"
            placeholder="••••••••"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Подтвердите пароль"
            placeholder="••••••••"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Создание…' : 'Создать аккаунт'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Уже есть аккаунт?{' '}
          <Link className="font-medium text-indigo-300 hover:text-indigo-200" to="/login">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
