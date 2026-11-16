import { useLayoutEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/features/auth/auth-context'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AssistantPage } from '@/pages/AssistantPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { TransactionsPage } from '@/pages/TransactionsPage'

function App() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const previousUserId = useRef(user?.id)

  useLayoutEffect(() => {
    if (previousUserId.current === user?.id) return

    previousUserId.current = user?.id
    queryClient.clear()
  }, [queryClient, user?.id])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<AssistantPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transacoes" element={<TransactionsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/perfil/editar" element={<ProfilePage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
