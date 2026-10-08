import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from '@/components/AppToaster'
import { getStoredToken } from '@/services/token'
import { LoginPage } from './LoginPage'

type InitialEntry = string | { pathname: string; state?: unknown }

const renderLogin = (initialEntry: InitialEntry = '/login') =>
  render(
    <ThemeProvider>
      <AppToaster />
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<div>Página de cadastro</div>} />
            <Route path="/transacoes" element={<div>Transações</div>} />
            <Route path="/" element={<div>Início</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )

const fillCredentials = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: email },
  })
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: password },
  })
}

const submit = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginPage (AC-006)', () => {
  it('exibe campos, botão Entrar, link Cadastre-se e o ThemeToggle', () => {
    renderLogin()

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cadastre-se' })).toHaveAttribute(
      'href',
      '/cadastro',
    )
    expect(
      screen.getByRole('button', { name: /alternar tema/i }),
    ).toBeInTheDocument()
  })

  it('valida inline e-mail inválido e senha curta', async () => {
    renderLogin()

    fillCredentials('demo', '123')
    submit()

    expect(
      await screen.findByText('Informe um e-mail válido'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('A senha deve ter ao menos 6 caracteres'),
    ).toBeInTheDocument()
  })

  it('mostra erro de credenciais inválidas sem guardar token', async () => {
    renderLogin()

    fillCredentials('demo@financas.dev', 'senha-errada')
    submit()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos',
    )
    expect(
      await screen.findByText(
        'Não foi possível entrar. Confira e-mail e senha.',
      ),
    ).toBeInTheDocument()
    expect(getStoredToken()).toBeNull()
  })

  it('autentica e redireciona para a rota de origem preservada', async () => {
    renderLogin({
      pathname: '/login',
      state: { from: { pathname: '/transacoes' } },
    })

    fillCredentials('demo@financas.dev', '123456')
    submit()

    expect(await screen.findByText('Transações')).toBeInTheDocument()
    expect(
      await screen.findByText('Login realizado com sucesso!'),
    ).toBeInTheDocument()
    expect(getStoredToken()).toBe('mock-access-token')
  })

  it('autentica e redireciona para / quando não há origem', async () => {
    renderLogin()

    fillCredentials('demo@financas.dev', '123456')
    submit()

    expect(await screen.findByText('Início')).toBeInTheDocument()
  })
})
