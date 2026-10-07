import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { ThemeProvider } from '@/app/providers/ThemeProvider'

const renderApp = () =>
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )

describe('App', () => {
  it('renderiza o título e o ThemeToggle no header (AC-006)', () => {
    renderApp()

    expect(
      screen.getByRole('heading', { name: 'Assistente Financeiro' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /alternar tema/i }),
    ).toBeInTheDocument()
  })

  it('usa tokens semânticos de tema no layout (AC-002)', () => {
    const { container } = renderApp()

    const root = container.firstElementChild
    expect(root?.className).toContain('bg-background')
    expect(root?.className).toContain('text-foreground')

    const header = container.querySelector('header')
    expect(header?.className).toContain('bg-card')
  })

  it('provê o ThemeProvider e a fonte Inter na raiz (AC-007)', () => {
    const mainSource = readFileSync(join(process.cwd(), 'src/main.tsx'), 'utf8')

    expect(mainSource).toContain('ThemeProvider')
    expect(mainSource).toContain('@fontsource/inter')
  })
})
