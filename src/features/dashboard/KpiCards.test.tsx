import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SummaryReport } from '@/types'
import { KpiCards } from './KpiCards'

const positiveSummary: SummaryReport = {
  income: 5200,
  expense: 1320.5,
  balance: 3879.5,
}

const negativeSummary: SummaryReport = {
  income: 100,
  expense: 300,
  balance: -200,
}

describe('KpiCards (AC-003)', () => {
  it('exibe os valores em BRL com cores por tipo', () => {
    render(<KpiCards summary={positiveSummary} />)

    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Saldo')).toBeInTheDocument()

    const incomeValue = screen.getByText(/5\.200,00/)
    expect(incomeValue.className).toContain('text-income')

    const expenseValue = screen.getByText(/1\.320,50/)
    expect(expenseValue.className).toContain('text-expense')

    expect(screen.getByText(/3\.879,50/)).toBeInTheDocument()
  })

  it('colore o saldo conforme o sinal', () => {
    const { unmount } = render(<KpiCards summary={positiveSummary} />)

    expect(screen.getByText(/3\.879,50/).className).toContain('text-income')
    unmount()

    render(<KpiCards summary={negativeSummary} />)

    const negativeBalance = screen.getByText(/200,00/)
    expect(negativeBalance.className).toContain('text-expense')
  })
})
