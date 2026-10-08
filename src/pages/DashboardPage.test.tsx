import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from './DashboardPage'

describe('DashboardPage (AC-009)', () => {
  it('renderiza o placeholder do dashboard', () => {
    render(<DashboardPage />)

    expect(
      screen.getByText('Bem-vindo ao seu assistente financeiro'),
    ).toBeInTheDocument()
    expect(screen.getByText(/próxima etapa/i)).toBeInTheDocument()
  })
})
