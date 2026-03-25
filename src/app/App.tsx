import { Link, NavLink } from 'react-router-dom'
import { AppRouter } from './router'

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm transition',
    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

export function App() {
  return (
    <div className="min-h-full">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/dashboard" className="text-sm font-semibold tracking-tight">
            AI Platform
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/login" className={navLinkClassName}>
              Login
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/assistants" className={navLinkClassName}>
              Assistants
            </NavLink>
            <NavLink to="/chats" className={navLinkClassName}>
              Chats
            </NavLink>
          </nav>
        </div>
      </header>

      <main>
        <AppRouter />
      </main>
    </div>
  )
}

