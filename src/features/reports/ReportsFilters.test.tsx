import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReportsFilterValues } from './ReportsFilters'
import { ReportsFilters } from './ReportsFilters'

const renderFilters = (
  onApply: (filters: ReportsFilterValues) => void = vi.fn(),
) => {
  render(<ReportsFilters onApply={onApply} />)

  return { onApply }
}

const apply = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
}

describe('ReportsFilters (AC-004)', () => {
  it('renderiza período, tipo e o botão de aplicar', () => {
    renderFilters()

    expect(screen.getByLabelText('De')).toBeInTheDocument()
    expect(screen.getByLabelText('Até')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toHaveValue('expense')
    expect(screen.getByRole('option', { name: 'Despesa' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Receita' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Aplicar filtros' }),
    ).toBeInTheDocument()
  })

  it('entrega o período e o tipo selecionado', () => {
    const { onApply } = renderFilters()

    fireEvent.change(screen.getByLabelText('De'), {
      target: { value: '2026-08-01' },
    })
    fireEvent.change(screen.getByLabelText('Até'), {
      target: { value: '2026-08-31' },
    })
    fireEvent.change(screen.getByLabelText('Tipo'), {
      target: { value: 'income' },
    })
    apply()

    expect(onApply).toHaveBeenCalledWith({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      type: 'income',
    })
  })

  it('usa despesas e período vazio por padrão', () => {
    const { onApply } = renderFilters()

    apply()

    expect(onApply).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
      type: 'expense',
    })
  })

  it('só aplica ao submeter, não a cada mudança', () => {
    const { onApply } = renderFilters()

    fireEvent.change(screen.getByLabelText('Tipo'), {
      target: { value: 'income' },
    })

    expect(onApply).not.toHaveBeenCalled()

    apply()

    expect(onApply).toHaveBeenCalledTimes(1)
  })
})
