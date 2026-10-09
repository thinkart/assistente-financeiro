import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { THEME_STORAGE_KEY } from '@/app/providers/theme-context'
import { setPrefersDark } from '@/test/match-media'
import { ThemeToggle } from './ThemeToggle'

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )

const getToggle = () => screen.getByRole('button', { name: /alternar tema/i })

describe('ThemeToggle (AC-001, AC-002, AC-003, AC-004)', () => {
  it('inicia no tema claro do sistema com ícone de sol (AC-001)', () => {
    const { container } = renderToggle()

    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
    expect(container.querySelector('.lucide-moon')).not.toBeInTheDocument()
    expect(
      document.documentElement.classList.contains('dark'),
    ).toBe(false)
  })

  it('inicia no tema escuro quando o sistema prefere escuro (AC-001)', () => {
    setPrefersDark(true)

    const { container } = renderToggle()

    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
    expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reflete mudanças do SO enquanto não houve toque (AC-001)', () => {
    const { container } = renderToggle()

    act(() => setPrefersDark(true))
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => setPrefersDark(false))
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('cada toque alterna o tema, persiste e atualiza a classe sem recarregar (AC-002)', () => {
    const { container } = renderToggle()

    fireEvent.click(getToggle())

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()

    fireEvent.click(getToggle())

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
  })

  it('primeiro toque parte do tema do sistema e vai para o oposto (AC-002)', () => {
    setPrefersDark(true)
    renderToggle()

    fireEvent.click(getToggle())

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('depois do primeiro toque não reage mais ao SO (AC-003)', () => {
    setPrefersDark(true)
    const { container } = renderToggle()

    fireEvent.click(getToggle())
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    act(() => setPrefersDark(false))
    act(() => setPrefersDark(true))

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
  })

  it('aplica o tema salvo ao sair e voltar (AC-003)', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')

    const { unmount, container } = renderToggle()
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()

    unmount()

    const { container: remounted } = renderToggle()

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(remounted.querySelector('.lucide-moon')).toBeInTheDocument()
  })

  it('não abre menu e mantém os atributos de acessibilidade do botão (AC-004)', () => {
    renderToggle()

    const toggle = getToggle()

    expect(toggle).toHaveAttribute('aria-label', 'Alternar tema')
    expect(toggle).not.toHaveAttribute('aria-haspopup')
    expect(toggle).not.toHaveAttribute('aria-expanded')
    expect(toggle.className).toContain('focus-visible:ring-2')

    fireEvent.click(toggle)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(getToggle()).toBe(toggle)
  })
})
