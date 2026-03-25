import { useEffect } from 'react'
import { AppRouter } from './router'
import { useAuthStore } from '../store/auth.store'
import { ToastHost } from '../shared/ui/ToastHost'

export function App() {
  useEffect(() => {
    useAuthStore.getState().init()
  }, [])

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/18 via-cyan-400/8 to-transparent blur-3xl" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-fuchsia-500/14 via-indigo-500/8 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_40%)]" />
      </div>

      <div className="relative">
        <AppRouter />
      </div>
      <ToastHost />
    </div>
  )
}

