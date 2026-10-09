import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import type { Transaction } from '@/types'
import { ResumoFinanceiroChart } from './ResumoFinanceiroChart'
import { buildMonthlySummary } from './monthly-summary'

const reference = new Date(2026, 9, 8)

const transaction = (
  overrides: Partial<Transaction> &
    Pick<Transaction, 'amount' | 'type' | 'date'>,
): Transaction => ({
  id: `t-${overrides.date}-${overrides.amount}`,
  description: 'Fixture',
  paymentMethod: 'pix',
  categoryId: 'alimentacao',
  ...overrides,
})

const data = buildMonthlySummary(
  [
    transaction({ amount: 5000, type: 'income', date: '2026-05-05' }),
    transaction({ amount: 1200, type: 'expense', date: '2026-05-10' }),
    transaction({ amount: 4800, type: 'income', date: '2026-06-05' }),
    transaction({ amount: 900, type: 'expense', date: '2026-06-10' }),
    transaction({ amount: 5200, type: 'income', date: '2026-07-05' }),
    transaction({ amount: 1500, type: 'expense', date: '2026-07-10' }),
    transaction({ amount: 5100, type: 'income', date: '2026-08-05' }),
    transaction({ amount: 1000, type: 'expense', date: '2026-08-10' }),
    transaction({ amount: 5300, type: 'income', date: '2026-09-05' }),
    transaction({ amount: 800, type: 'expense', date: '2026-09-10' }),
    transaction({ amount: 5400, type: 'income', date: '2026-10-05' }),
    transaction({ amount: 1100, type: 'expense', date: '2026-10-10' }),
  ],
  reference,
)

describe('ResumoFinanceiroChart (AC-003)', () => {
  it('renderiza o título, a legenda e uma linha por série', async () => {
    const { container } = render(
      <ThemeProvider>
        <ResumoFinanceiroChart data={data} />
      </ThemeProvider>,
    )

    expect(screen.getByText('Resumo Financeiro')).toBeInTheDocument()
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('Despesa')).toBeInTheDocument()
    expect(screen.getByText('Saldo')).toBeInTheDocument()

    await waitFor(() => {
      expect(container.querySelectorAll('.recharts-line')).toHaveLength(3)
    })
  })

  it('aplica as cores dos tokens de gráfico em cada linha (AC-001)', async () => {
    document.documentElement.style.setProperty('--chart-income', '221 83% 53%')
    document.documentElement.style.setProperty('--chart-expense', '0 84% 60%')
    document.documentElement.style.setProperty('--chart-balance', '142 71% 45%')

    try {
      const { container } = render(
        <ThemeProvider>
          <ResumoFinanceiroChart data={data} />
        </ThemeProvider>,
      )

      await waitFor(() => {
        expect(
          container.querySelectorAll('.recharts-line-curve'),
        ).toHaveLength(3)
      })

      const strokes = Array.from(
        container.querySelectorAll('.recharts-line-curve'),
      ).map((line) => line.getAttribute('stroke'))

      expect(strokes).toEqual([
        'hsl(221 83% 53%)',
        'hsl(0 84% 60%)',
        'hsl(142 71% 45%)',
      ])
    } finally {
      document.documentElement.style.removeProperty('--chart-income')
      document.documentElement.style.removeProperty('--chart-expense')
      document.documentElement.style.removeProperty('--chart-balance')
    }
  })
})
