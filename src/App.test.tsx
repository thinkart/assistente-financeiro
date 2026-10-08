import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { setStoredToken } from '@/services/token'

const renderApp = (initialEntry = '/') =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )

describe('rotas do App (AC-001)', () => {
  it('redireciona a área privada para /login quando não há sessão', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('button', { name: 'Entrar' }),
    ).toBeInTheDocument()
  })

  it('renderiza a página de cadastro em /cadastro', () => {
    renderApp('/cadastro')

    expect(
      screen.getByRole('button', { name: 'Criar conta' }),
    ).toBeInTheDocument()
  })

  it('redireciona rotas desconhecidas para a área privada (e daí para o login)', async () => {
    renderApp('/rota-inexistente')

    expect(
      await screen.findByRole('button', { name: 'Entrar' }),
    ).toBeInTheDocument()
  })

  it('mostra a área privada quando há sessão válida', async () => {
    setStoredToken('mock-access-token')

    renderApp('/')

    expect(
      await screen.findByText('Bem-vindo ao seu assistente financeiro'),
    ).toBeInTheDocument()
  })
})

describe('main.tsx', () => {
  it('provê tema, roteador e sessão na raiz (AC-007, AC-001)', () => {
    const mainSource = readFileSync(join(process.cwd(), 'src/main.tsx'), 'utf8')

    expect(mainSource).toContain('ThemeProvider')
    expect(mainSource).toContain('BrowserRouter')
    expect(mainSource).toContain('AuthProvider')
    expect(mainSource).toContain('@fontsource/inter')
  })
})
