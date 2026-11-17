import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { meRequest } from '@/features/auth/service'
import { setStoredToken } from '@/services/token'

const renderApp = (initialEntry = '/') =>
  render(
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>,
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

  it('redireciona / para o dashboard quando há sessão válida', async () => {
    setStoredToken('mock-access-token')

    renderApp('/')

    expect(
      await screen.findByText('Resumo financeiro do mês'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Olá, Demo' }),
    ).not.toBeInTheDocument()
  })

  it('mantém o dashboard existente disponível em /dashboard', async () => {
    setStoredToken('mock-access-token')

    renderApp('/dashboard')

    expect(
      await screen.findByText('Resumo financeiro do mês'),
    ).toBeInTheDocument()
  })

  it('retorna à rota privada originalmente solicitada após login', async () => {
    renderApp('/transacoes')

    fireEvent.change(await screen.findByLabelText('E-mail'), {
      target: { value: 'demo@financas.dev' },
    })
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByRole('heading', { name: 'Transações cadastradas' }),
    ).toBeInTheDocument()
  })

  it('renderiza a página de transações na rota /transacoes', async () => {
    setStoredToken('mock-access-token')

    renderApp('/transacoes')

    expect(
      await screen.findByText('Transações cadastradas'),
    ).toBeInTheDocument()
  })

  it('renderiza a página de categorias na rota /categorias', async () => {
    setStoredToken('mock-access-token')

    renderApp('/categorias')

    expect(
      await screen.findByRole('heading', { name: 'Categorias' }),
    ).toBeInTheDocument()
  })

  it('renderiza a página de relatórios na rota /relatorios', async () => {
    setStoredToken('mock-access-token')

    renderApp('/relatorios')

    expect(
      await screen.findByRole('heading', { name: 'Relatórios' }),
    ).toBeInTheDocument()
  })

  it('renderiza a edição de conta em /perfil/editar', async () => {
    setStoredToken('mock-access-token')

    renderApp('/perfil/editar')

    expect(
      await screen.findByRole('heading', { name: 'Editar conta' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
    expect(screen.queryByText('Exportar dados')).not.toBeInTheDocument()
  })

  it('mantém o perfil e a exportação em CSV acessíveis em /perfil', async () => {
    setStoredToken('mock-access-token')

    renderApp('/perfil')

    expect(
      await screen.findByRole('heading', { name: 'Perfil' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Baixar PDF' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Baixar CSV' }),
    ).toBeInTheDocument()
  })

  it('mascara dados existentes e salva CPF/telefone normalizados no perfil', async () => {
    setStoredToken('mock-access-token')

    renderApp('/perfil/editar')

    const cpf = await screen.findByLabelText('CPF')
    const phone = screen.getByLabelText('Telefone')
    expect(cpf).toHaveValue('529.982.247-25')
    expect(phone).toHaveValue('(11) 99999-0000')

    fireEvent.change(cpf, { target: { value: '11144477735' } })
    fireEvent.change(phone, { target: { value: '1123456789' } })
    expect(cpf).toHaveValue('111.444.777-35')
    expect(phone).toHaveValue('(11) 2345-6789')

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByRole('heading', { name: 'Perfil' }),
    ).toBeInTheDocument()
    await expect(meRequest()).resolves.toMatchObject({
      cpf: '11144477735',
      phone: '1123456789',
    })
  })
})

describe('main.tsx', () => {
  it('provê tema, toaster, roteador e sessão na raiz (AC-007, AC-001, AC-010)', () => {
    const mainSource = readFileSync(join(process.cwd(), 'src/main.tsx'), 'utf8')

    expect(mainSource).toContain('ThemeProvider')
    expect(mainSource).toContain('AppToaster')
    expect(mainSource).toContain('BrowserRouter')
    expect(mainSource).toContain('AuthProvider')
    expect(mainSource).toContain('@fontsource/inter')
  })
})
