import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { getStoredToken, setStoredToken } from '@/services/token'
import { AppLayout } from './AppLayout'

const renderLayout = () => {
  setStoredToken('mock-access-token')

  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<div>Conteúdo do dashboard</div>} />
              </Route>
            </Route>
            <Route path="/login" element={<div>Página de login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}

describe('AppLayout (AC-009)', () => {
  it('mostra usuário, ThemeToggle, Sair e a navegação lateral', async () => {
    renderLayout()

    expect(await screen.findByText('Demo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /alternar tema/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()

    for (const label of [
      'Dashboard',
      'Transações',
      'Categorias',
      'Relatórios',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('renderiza o conteúdo da rota filha no main', async () => {
    renderLayout()

    expect(await screen.findByText('Conteúdo do dashboard')).toBeInTheDocument()
  })

  it('Sair limpa a sessão e volta para /login', async () => {
    renderLayout()

    fireEvent.click(await screen.findByRole('button', { name: /sair/i }))

    expect(await screen.findByText('Página de login')).toBeInTheDocument()
    expect(getStoredToken()).toBeNull()
  })
})
