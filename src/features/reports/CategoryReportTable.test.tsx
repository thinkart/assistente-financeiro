import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CategoryReport } from '@/types'
import { CategoryReportTable } from './CategoryReportTable'

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

const renderTable = () => render(<CategoryReportTable report={report} />)

describe('CategoryReportTable (AC-006)', () => {
  it('lista categoria, total e percentual formatados', () => {
    renderTable()

    const table = screen.getByRole('table')
    for (const header of ['Categoria', 'Total', 'Percentual']) {
      expect(
        within(table).getByRole('columnheader', { name: header }),
      ).toBeInTheDocument()
    }

    expect(within(table).getByText('Alimentação')).toBeInTheDocument()
    expect(within(table).getByText(/400,00/)).toBeInTheDocument()
    expect(within(table).getByText('57,14%')).toBeInTheDocument()

    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(3)
    expect(rows[0]?.className).toContain('odd:bg-muted/40')
  })

  it('renderiza a versão mobile em lista', () => {
    renderTable()

    const list = screen.getByRole('list', {
      name: 'Detalhamento por categoria (mobile)',
    })

    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(within(list).getByText('Transporte')).toBeInTheDocument()
    expect(within(list).getByText('28,57%')).toBeInTheDocument()
  })
})
