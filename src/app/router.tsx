import { Navigate, Route, Routes } from 'react-router-dom'
import { AssistantsPage } from '../pages/AssistantsPage'
import { ChatsPage } from '../pages/ChatsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/assistants" element={<AssistantsPage />} />
      <Route path="/chats" element={<ChatsPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

