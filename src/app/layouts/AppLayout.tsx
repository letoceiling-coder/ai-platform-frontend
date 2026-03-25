import { motion } from 'framer-motion'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assistants', label: 'Assistants' },
  { to: '/chats', label: 'Chats' },
  { to: '/api-keys', label: 'API Keys' },
  { to: '/documents', label: 'Knowledge' },
  { to: '/behavior', label: 'Behavior' },
  { to: '/widget', label: 'Widget' },
] as const

function SidebarNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-white/10 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]'
            : 'text-slate-300 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      <motion.span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.18 }}
        style={{
          background:
            'radial-gradient(600px circle at 20% 0%, rgba(99,102,241,0.18), transparent 40%), radial-gradient(500px circle at 70% 100%, rgba(34,211,238,0.12), transparent 45%)',
        }}
      />
      <span className="relative">{label}</span>
    </NavLink>
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-full">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex h-full flex-col p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="text-xs font-medium tracking-[0.22em] text-slate-300">AI PLATFORM</div>
            <div className="mt-1 text-sm font-semibold tracking-tight text-white">Console</div>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <SidebarNavLink key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-300">Workspace</div>
              <div className="mt-1 text-sm font-medium text-white">Production</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
            <div className="text-sm text-slate-300">
              <span className="text-white/90">AI Platform</span>
              <span className="mx-2 text-white/10">/</span>
              <span className="text-slate-300">SaaS</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                user@example.com
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 active:bg-white/5"
                onClick={onLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-6 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

