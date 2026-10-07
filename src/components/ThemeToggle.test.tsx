import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )

const getTrigger = () => screen.getByRole('button', { name: /alternar tema/i })

describe('ThemeToggle (AC-006)', () => {
  it('renderiza o botão com ícone de sol e atributos de acessibilidade', () => {
    const { container } = renderToggle()

    const trigger = getTrigger()
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('abre o dropdown com as três opções e marca a ativa', () => {
    renderToggle()

    fireEvent.click(getTrigger())

    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')

    const menu = screen.getByRole('menu')
    const options = within(menu).getAllByRole('menuitemradio')
    expect(options).toHaveLength(3)
    expect(
      within(menu).getByRole('menuitemradio', { name: /sistema/i }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(
      within(menu).getByRole('menuitemradio', { name: /claro/i }),
    ).toHaveAttribute('aria-checked', 'false')
  })

  it('seleciona um tema, aplica a classe dark, persiste e fecha o dropdown', () => {
    renderToggle()

    fireEvent.click(getTrigger())
    fireEvent.click(screen.getByRole('menuitemradio', { name: /escuro/i }))

    expect(localStorage.getItem('financas-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('mostra o ícone de lua quando o tema resolvido é escuro', () => {
    localStorage.setItem('financas-theme', 'dark')

    const { container } = renderToggle()

    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
    expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument()
  })

  it('fecha com a tecla Escape e devolve o foco ao botão', () => {
    renderToggle()

    fireEvent.click(getTrigger())
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(getTrigger()).toHaveFocus()
  })

  it('fecha ao clicar fora', () => {
    renderToggle()

    fireEvent.click(getTrigger())
    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
