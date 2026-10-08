import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category, TransactionFilters } from '@/types'
import { FiltersBar } from './FiltersBar'

const categories: Category[] = [
  { id: 'salario', name: 'Salário', type: 'income' },
  { id: 'alimentacao', name: 'Alimentação', type: 'expense' },
]

const renderBar = (
  onApply: (filters: TransactionFilters) => void = vi.fn(),
) => {
  render(<FiltersBar categories={categories} onApply={onApply} />)

  return { onApply }
}

const apply = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
}

describe('FiltersBar (AC-006)', () => {
  it('renderiza os campos do wireframe e o botão de aplicar', () => {
    renderBar()

    expect(screen.getByLabelText('Buscar')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('De')).toBeInTheDocument()
    expect(screen.getByLabelText('Até')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Aplicar filtros' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Receita' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Despesa' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Alimentação' }),
    ).toBeInTheDocument()
  })

  it('entrega os filtros preenchidos ao aplicar', () => {
    const { onApply } = renderBar()

    fireEvent.change(screen.getByLabelText('Buscar'), {
      target: { value: 'merc' },
    })
    fireEvent.change(screen.getByLabelText('Tipo'), {
      target: { value: 'income' },
    })
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'alimentacao' },
    })
    fireEvent.change(screen.getByLabelText('De'), {
      target: { value: '2026-10-01' },
    })
    fireEvent.change(screen.getByLabelText('Até'), {
      target: { value: '2026-10-31' },
    })
    apply()

    expect(onApply).toHaveBeenCalledWith({
      search: 'merc',
      type: 'income',
      categoryId: 'alimentacao',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    })
  })

  it('omite os filtros vazios', () => {
    const { onApply } = renderBar()

    apply()

    expect(onApply).toHaveBeenCalledWith({
      search: undefined,
      type: undefined,
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
    })
  })

  it('só aplica ao submeter, não a cada digitação', () => {
    const { onApply } = renderBar()

    fireEvent.change(screen.getByLabelText('Buscar'), {
      target: { value: 'uber' },
    })

    expect(onApply).not.toHaveBeenCalled()

    apply()

    expect(onApply).toHaveBeenCalledTimes(1)
  })
})
