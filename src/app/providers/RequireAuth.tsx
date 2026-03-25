import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/auth.store'

export function RequireAuth() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const isLoading = useAuthStore((s) => s.isLoading)
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !token) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isLoading, token, navigate, location.pathname])

  if (isLoading) {
    return null
  }

  if (!token) {
    return null
  }

  return <Outlet />
}

