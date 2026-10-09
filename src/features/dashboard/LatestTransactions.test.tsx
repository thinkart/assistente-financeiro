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

describe('LatestTransactions (AC-001, AC-002)', () => {
  it('mostra apenas as 5 mais recentes em lista única, sem tabela, e o link Ver todas', () => {
    renderComponent()

    const list = screen.getByRole('list', { name: 'Últimas transações' })
    const items = within(list).getAllByRole('listitem')

    expect(items).toHaveLength(5)
    expect(within(list).getByText('Transação 1')).toBeInTheDocument()
    expect(within(list).getByText('Transação 5')).toBeInTheDocument()
    expect(within(list).queryByText('Transação 6')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

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

    const list = screen.getByRole('list', { name: 'Últimas transações' })

    expect(within(list).getByText('05/10/2026')).toBeInTheDocument()

    const incomeValue = within(list).getByText(/5\.200,00/)
    expect(incomeValue).toHaveTextContent('+')
    expect(incomeValue.className).toContain('text-income')

    const expenseValue = within(list).getByText(/320,50/)
    expect(expenseValue).toHaveTextContent('-')
    expect(expenseValue.className).toContain('text-expense')
  })

  it('replica o layout da lista mobile em qualquer tamanho de tela', () => {
    renderComponent([makeTransaction(1)])

    const list = screen.getByRole('list', { name: 'Últimas transações' })
    const item = within(list).getAllByRole('listitem')[0] as HTMLElement

    expect(item.className).toContain('flex')
    expect(item.className).toContain('justify-between')
    expect(item.className).toContain('border-b')
    expect(item.className).toContain('py-2')
    expect(item.className).toContain('text-sm')
    expect(item.className).toContain('last:border-0')

    const description = within(item).getByText('Transação 1')
    expect(description.className).toContain('truncate')
    expect(description.className).toContain('font-medium')

    const date = within(item).getByText('01/10/2026')
    expect(date.className).toContain('text-xs')
    expect(date.className).toContain('text-muted-foreground')

    const value = within(item).getByText(/101,00/)
    expect(value.className).toContain('whitespace-nowrap')
  })

  it('mostra o estado vazio quando não há transações', () => {
    renderComponent([])

    expect(screen.getByRole('status')).toHaveTextContent(
      'Nenhuma transação encontrada.',
    )
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
