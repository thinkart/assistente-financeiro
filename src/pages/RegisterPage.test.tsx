import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from '@/components/AppToaster'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { getStoredToken } from '@/services/token'
import { RegisterPage } from './RegisterPage'

const renderRegister = () =>
  render(
    <ThemeProvider>
      <AppToaster />
      <AuthProvider>
        <MemoryRouter initialEntries={['/cadastro']}>
          <Routes>
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/login" element={<div>Página de login</div>} />
            <Route path="/" element={<div>Início</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )

const fill = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

const submit = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
}

const fillValidForm = (email: string, cpf = '98765432100') => {
  fill('Nome completo', 'Nova Pessoa')
  fill('CPF', cpf)
  fill('E-mail', email)
  fill('Telefone', '(11) 98888-7777')
  fill('Senha', '123456')
  fill('Confirmar senha', '123456')
}

describe('RegisterPage (AC-007)', () => {
  it('exibe os campos do wireframe, botões e link para o login', () => {
    renderRegister()

    for (const label of [
      'Nome completo',
      'CPF',
      'E-mail',
      'Telefone',
      'Senha',
      'Confirmar senha',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }

    expect(
      screen.getByRole('button', { name: 'Criar conta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Fazer login' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('button', { name: /alternar tema/i }),
    ).toBeInTheDocument()
  })

  it('valida inline todos os campos', async () => {
    renderRegister()

    fill('Nome completo', 'An')
    fill('CPF', '123')
    fill('E-mail', 'x')
    fill('Telefone', '123')
    fill('Senha', '123')
    fill('Confirmar senha', '321')
    submit()

    expect(
      await screen.findByText('Informe o nome completo (mínimo 3 caracteres)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Informe um CPF com 11 dígitos'),
    ).toBeInTheDocument()
    expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument()
    expect(
      screen.getByText('Informe um telefone com DDD (10 ou 11 dígitos)'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('A senha deve ter ao menos 6 caracteres'),
    ).toBeInTheDocument()
    expect(screen.getByText('As senhas não conferem')).toBeInTheDocument()
  })

  it('cria a conta, autentica e redireciona para /', async () => {
    renderRegister()
    fillValidForm(`cad-${Date.now()}@financas.dev`)
    submit()

    expect(await screen.findByText('Início')).toBeInTheDocument()
    expect(
      await screen.findByText('Conta criada com sucesso!'),
    ).toBeInTheDocument()
    expect(getStoredToken()).toBe('mock-access-token')
  })

  it('mostra a mensagem do backend para e-mail duplicado', async () => {
    renderRegister()
    fillValidForm('demo@financas.dev', '11122233344')
    submit()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail já cadastrado',
    )
    expect(
      await screen.findByText('Não foi possível criar a conta'),
    ).toBeInTheDocument()
    expect(getStoredToken()).toBeNull()
  })

  it('limpa o formulário com o botão Limpar', () => {
    renderRegister()
    fill('Nome completo', 'Ana Souza')
    fill('E-mail', 'ana@financas.dev')

    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))

    expect(screen.getByLabelText('Nome completo')).toHaveValue('')
    expect(screen.getByLabelText('E-mail')).toHaveValue('')
  })
})
