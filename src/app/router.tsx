import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { OnboardingGate } from './providers/OnboardingGate'
import { RequireAuth } from './providers/RequireAuth'
import { AssistantsPage } from '../pages/AssistantsPage'
import { ApiKeysPage } from '../pages/ApiKeysPage'
import { ChatsPage } from '../pages/ChatsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DocumentsPage } from '../pages/DocumentsPage'
import { BehaviorPage } from '../pages/BehaviorPage'
import { WidgetPage } from '../pages/WidgetPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { OnboardingPage } from '../pages/OnboardingPage'

function ProtectedRoutes() {
  return <AppLayout />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<OnboardingGate />}>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assistants" element={<AssistantsPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/behavior" element={<BehaviorPage />} />
            <Route path="/widget" element={<WidgetPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
