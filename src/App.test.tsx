import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { setStoredToken } from '@/services/token'

const renderApp = (initialEntry = '/') =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </AuthProvider>,
  )

describe('rotas do App (AC-001)', () => {
  it('redireciona a área privada para /login quando não há sessão', async () => {
    renderApp('/')

    expect(await screen.findByText('Página de login')).toBeInTheDocument()
  })

  it('renderiza a página de cadastro em /cadastro', () => {
    renderApp('/cadastro')

    expect(screen.getByText('Página de cadastro')).toBeInTheDocument()
  })

  it('redireciona rotas desconhecidas para a área privada (e daí para o login)', async () => {
    renderApp('/rota-inexistente')

    expect(await screen.findByText('Página de login')).toBeInTheDocument()
  })

  it('mostra a área privada quando há sessão válida', async () => {
    setStoredToken('mock-access-token')

    renderApp('/')

    expect(await screen.findByText('Área privada')).toBeInTheDocument()
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
