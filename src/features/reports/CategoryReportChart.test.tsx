import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import type { CategoryReport } from '@/types'
import { CategoryReportChart } from './CategoryReportChart'

const report: CategoryReport[] = [
  {
    categoryId: 'alimentacao',
    categoryName: 'Alimentação',
    total: 400,
    percentage: 57.14,
  },
  {
    categoryId: 'transporte',
    categoryName: 'Transporte',
    total: 200,
    percentage: 28.57,
  },
  { categoryId: 'lazer', categoryName: 'Lazer', total: 100, percentage: 14.29 },
]

const renderChart = (type: 'income' | 'expense' = 'expense') =>
  render(
    <ThemeProvider>
      <CategoryReportChart report={report} type={type} />
    </ThemeProvider>,
  )

describe('CategoryReportChart (AC-005)', () => {
  it('usa o título conforme o tipo', () => {
    const { unmount } = renderChart('expense')
    expect(screen.getByText('Despesas por categoria')).toBeInTheDocument()
    unmount()

    renderChart('income')
    expect(screen.getByText('Receitas por categoria')).toBeInTheDocument()
  })

  it('renderiza uma barra horizontal por categoria com os nomes', async () => {
    const { container } = renderChart()

    await waitFor(() => {
      expect(
        container.querySelectorAll('.recharts-bar-rectangle'),
      ).toHaveLength(3)
    })

    expect(container.textContent).toContain('Alimentação')
    expect(container.textContent).toContain('Transporte')
    expect(container.textContent).toContain('Lazer')
  })
})
