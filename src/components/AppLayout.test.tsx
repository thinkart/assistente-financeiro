import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { getStoredToken, setStoredToken } from '@/services/token'
import { AppLayout } from './AppLayout'

const renderLayout = (initialEntry = '/') => {
  setStoredToken('mock-access-token')

  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<div>Conteúdo do dashboard</div>} />
                <Route
                  path="/transacoes"
                  element={<div>Conteúdo de transações</div>}
                />
                <Route
                  path="/categorias"
                  element={<div>Conteúdo de categorias</div>}
                />
                <Route
                  path="/relatorios"
                  element={<div>Conteúdo de relatórios</div>}
                />
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

const openMobileMenu = async () => {
  const trigger = screen.getByRole('button', { name: /abrir menu/i })
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
  return { trigger, menu: await screen.findByRole('menu') }
}

describe('AppLayout — menu mobile (AC-003)', () => {
  it('exibe o gatilho apenas em telas estreitas e reflete aria-expanded', async () => {
    renderLayout()
    await screen.findByText('Demo')

    const trigger = screen.getByRole('button', { name: /abrir menu/i })
    expect(trigger.className).toContain('sm:hidden')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('oferece os quatro destinos de navegação', async () => {
    renderLayout()
    await screen.findByText('Demo')
    await openMobileMenu()

    for (const label of [
      'Dashboard',
      'Transações',
      'Categorias',
      'Relatórios',
    ]) {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument()
    }
  })

  it('destaca a rota ativa no menu', async () => {
    renderLayout('/transacoes')
    await screen.findByText('Demo')
    await openMobileMenu()

    expect(
      screen.getByRole('menuitem', { name: 'Transações' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('menuitem', { name: 'Dashboard' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('navega, fecha o menu e atualiza o aria-expanded', async () => {
    renderLayout()
    await screen.findByText('Demo')
    const { trigger } = await openMobileMenu()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Transações' }))

    expect(
      await screen.findByText('Conteúdo de transações'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('fecha com a tecla Escape', async () => {
    renderLayout()
    await screen.findByText('Demo')
    await openMobileMenu()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})

describe('AppLayout — foco visível na navegação (AC-004)', () => {
  it('aplica anel de foco nos links da sidebar e do menu mobile', async () => {
    renderLayout()
    await screen.findByText('Demo')

    expect(screen.getByRole('link', { name: 'Dashboard' }).className).toContain(
      'focus-visible:ring-2',
    )

    await openMobileMenu()

    expect(
      screen.getByRole('menuitem', { name: 'Dashboard' }).className,
    ).toContain('focus-visible:ring-2')
  })
})
