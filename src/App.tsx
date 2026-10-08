import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/features/auth/RequireAuth'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Página de login</div>} />
      <Route path="/cadastro" element={<div>Página de cadastro</div>} />

      <Route element={<RequireAuth />}>
        <Route path="/" element={<div>Área privada</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
