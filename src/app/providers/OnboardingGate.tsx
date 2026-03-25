import { Navigate, Outlet } from 'react-router-dom'
import { useAssistants } from '../../api/assistants.hooks'

export function OnboardingGate() {
  const assistants = useAssistants()

  if (assistants.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-300">Загрузка…</div>
    )
  }

  const list = assistants.data ?? []
  if (list.length === 0) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
