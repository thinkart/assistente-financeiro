import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { LatestTransactions } from './LatestTransactions'

const makeTransaction = (
  index: number,
  overrides: Partial<Transaction> = {},
): Transaction => ({
  id: `t${index}`,
  description: `Transação ${index}`,
  amount: 100 + index,
  type: 'expense',
  paymentMethod: 'pix',
  date: `2026-10-${String(index).padStart(2, '0')}`,
  categoryId: 'alimentacao',
  ...overrides,
})

const transactions = [1, 2, 3, 4, 5, 6, 7].map((index) =>
  makeTransaction(index),
)

const renderComponent = (items: Transaction[] = transactions) =>
  render(
    <MemoryRouter>
      <LatestTransactions transactions={items} />
    </MemoryRouter>,
  )

describe('LatestTransactions (AC-005)', () => {
  it('mostra apenas as 5 mais recentes e o link Ver todas', () => {
    renderComponent()

    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)

    expect(rows).toHaveLength(5)
    expect(within(table).getByText('Transação 1')).toBeInTheDocument()
    expect(within(table).getByText('Transação 5')).toBeInTheDocument()
    expect(within(table).queryByText('Transação 6')).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Ver todas' })).toHaveAttribute(
      'href',
      '/transacoes',
    )
  })

  it('formata data e valor com sinal e token por tipo', () => {
    renderComponent([
      makeTransaction(1, {
        amount: 5200,
        type: 'income',
        date: '2026-10-05',
      }),
      makeTransaction(2, {
        amount: 320.5,
        type: 'expense',
        date: '2026-10-01',
      }),
    ])

    const table = screen.getByRole('table')

    expect(within(table).getByText('05/10/2026')).toBeInTheDocument()

    const incomeValue = within(table).getByText(/5\.200,00/)
    expect(incomeValue).toHaveTextContent('+')
    expect(incomeValue.className).toContain('text-income')

    const expenseValue = within(table).getByText(/320,50/)
    expect(expenseValue).toHaveTextContent('-')
    expect(expenseValue.className).toContain('text-expense')
  })

  it('renderiza a versão mobile em cards', () => {
    renderComponent()

    const list = screen.getByRole('list', {
      name: 'Últimas transações (mobile)',
    })

    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(within(list).getByText('Transação 1')).toBeInTheDocument()
  })

  it('mostra o estado vazio quando não há transações', () => {
    renderComponent([])

    expect(
      screen.getByText('Nenhuma transação encontrada.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
