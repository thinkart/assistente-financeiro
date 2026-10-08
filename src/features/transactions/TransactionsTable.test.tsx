import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category, Transaction } from '@/types'
import { TransactionsTable } from './TransactionsTable'

const categories: Category[] = [
  { id: 'salario', name: 'Salário', type: 'income' },
  { id: 'alimentacao', name: 'Alimentação', type: 'expense' },
]

const transactions: Transaction[] = [
  {
    id: 't1',
    description: 'Salário de outubro',
    amount: 5200,
    type: 'income',
    paymentMethod: 'pix',
    date: '2026-10-05',
    categoryId: 'salario',
  },
  {
    id: 't2',
    description: 'Mercado',
    amount: 320.5,
    type: 'expense',
    paymentMethod: 'debito',
    date: '2026-10-01',
    categoryId: 'alimentacao',
  },
  {
    id: 't3',
    description: 'Transação órfã',
    amount: 10,
    type: 'expense',
    paymentMethod: 'pix',
    date: '2026-10-03',
    categoryId: 'inexistente',
  },
]

const renderTable = (
  overrides: Partial<{ onEdit: VoidFunction; onDelete: VoidFunction }> = {},
) => {
  const onEdit = overrides.onEdit ?? vi.fn()
  const onDelete = overrides.onDelete ?? vi.fn()

  render(
    <TransactionsTable
      transactions={transactions}
      categories={categories}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )

  return { onEdit, onDelete }
}

describe('TransactionsTable (AC-005)', () => {
  it('renderiza os cabeçalhos e os dados formatados na tabela desktop', () => {
    renderTable()

    const table = screen.getByRole('table')
    for (const header of [
      'Data',
      'Descrição',
      'Categoria',
      'Tipo',
      'Valor',
      'Ações',
    ]) {
      expect(
        within(table).getByRole('columnheader', { name: header }),
      ).toBeInTheDocument()
    }

    expect(within(table).getByText('Mercado')).toBeInTheDocument()
    expect(within(table).getByText('Alimentação')).toBeInTheDocument()
    expect(within(table).getByText('Receita')).toBeInTheDocument()
    expect(within(table).getAllByText('Despesa')).toHaveLength(2)
    expect(within(table).getByText('01/10/2026')).toBeInTheDocument()
    expect(within(table).getByText('Sem categoria')).toBeInTheDocument()
  })

  it('mostra sinal e token de cor conforme o tipo', () => {
    renderTable()

    const table = screen.getByRole('table')
    const incomeValue = within(table).getByText(/5\.200,00/)
    expect(incomeValue).toHaveTextContent('+')
    expect(incomeValue.closest('td')?.className).toContain('text-income')

    const expenseValue = within(table).getByText(/320,50/)
    expect(expenseValue).toHaveTextContent('-')
    expect(expenseValue.closest('td')?.className).toContain('text-expense')
  })

  it('usa linhas zebradas na tabela', () => {
    renderTable()

    const table = screen.getByRole('table')
    const bodyRows = within(table).getAllByRole('row').slice(1)

    expect(bodyRows.length).toBe(transactions.length)
    expect(bodyRows[0]?.className).toContain('odd:bg-muted/40')
  })

  it('chama onEdit e onDelete com a transação da linha', () => {
    const { onEdit, onDelete } = renderTable()

    const table = screen.getByRole('table')
    const row = within(table).getByText('Mercado').closest('tr') as HTMLElement

    fireEvent.click(within(row).getByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(transactions[1])

    fireEvent.click(within(row).getByRole('button', { name: 'Excluir' }))
    expect(onDelete).toHaveBeenCalledWith(transactions[1])
  })

  it('renderiza a versão em cards para mobile com as mesmas informações', () => {
    const { onEdit } = renderTable()

    const list = screen.getByRole('list', {
      name: 'Lista de transações (mobile)',
    })

    expect(within(list).getByText('Mercado')).toBeInTheDocument()
    expect(within(list).getByText('01/10/2026')).toBeInTheDocument()
    expect(within(list).getByText('Alimentação')).toBeInTheDocument()
    expect(within(list).getByText('Receita')).toBeInTheDocument()

    const mercadoCard = within(list)
      .getByText('Mercado')
      .closest('li') as HTMLElement
    fireEvent.click(within(mercadoCard).getByRole('button', { name: 'Editar' }))

    expect(onEdit).toHaveBeenCalledWith(transactions[1])
  })
})
