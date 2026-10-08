import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { setStoredToken } from '@/services/token'
import { AuthProvider } from './AuthProvider'
import { RequireAuth } from './RequireAuth'

const LoginProbe = () => {
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from

  return <div>Login (origem: {from?.pathname ?? 'nenhuma'})</div>
}

const renderProtected = (initialEntry = '/') =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<div>Área privada</div>} />
            <Route path="/transacoes" element={<div>Transações</div>} />
          </Route>
          <Route path="/login" element={<LoginProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

describe('RequireAuth (AC-008)', () => {
  it('redireciona para /login preservando a origem quando não há sessão', async () => {
    renderProtected('/transacoes')

    expect(
      await screen.findByText('Login (origem: /transacoes)'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Transações')).not.toBeInTheDocument()
  })

  it('renderiza a área privada quando há sessão válida', async () => {
    setStoredToken('mock-access-token')

    renderProtected()

    expect(await screen.findByText('Área privada')).toBeInTheDocument()
  })

  it('mostra o estado de carregamento enquanto restaura a sessão', async () => {
    setStoredToken('mock-access-token')

    renderProtected()

    expect(screen.getByRole('status')).toBeInTheDocument()
    await screen.findByText('Área privada')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
