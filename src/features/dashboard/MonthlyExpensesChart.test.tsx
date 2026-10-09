import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import type { Transaction } from '@/types'
import { MonthlyExpensesChart } from './MonthlyExpensesChart'
import { resolveChartColor } from './chart-color'
import { buildMonthlyExpenses } from './monthly-expenses'

const reference = new Date(2026, 9, 8)

const expense = (date: string, amount: number): Transaction => ({
  id: date,
  description: 'Despesa',
  amount,
  type: 'expense',
  paymentMethod: 'pix',
  date,
  categoryId: 'alimentacao',
})

const data = buildMonthlyExpenses(
  [
    expense('2026-05-10', 100),
    expense('2026-06-10', 110),
    expense('2026-07-10', 120),
    expense('2026-08-10', 130),
    expense('2026-09-10', 140),
    expense('2026-10-10', 150),
  ],
  reference,
)

describe('MonthlyExpensesChart (AC-004)', () => {
  it('resolve a cor do gráfico a partir da CSS variable', () => {
    expect(resolveChartColor('0 84% 60%')).toBe('hsl(0 84% 60%)')
    expect(resolveChartColor('  ')).toBe('currentColor')
  })

  it('renderiza o título e uma barra por mês', async () => {
    const { container } = render(
      <ThemeProvider>
        <MonthlyExpensesChart data={data} />
      </ThemeProvider>,
    )

    expect(screen.getByText('Despesas por mês (R$)')).toBeInTheDocument()

    await waitFor(() => {
      expect(
        container.querySelectorAll('.recharts-bar-rectangle'),
      ).toHaveLength(6)
    })
  })
})
