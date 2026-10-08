import { beforeEach, describe, expect, it } from 'vitest'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { transactions as seedTransactions } from '@/mocks/data'
import type { TransactionInput } from '@/types'
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from './transactions'

const newTransaction: TransactionInput = {
  description: 'Nova despesa',
  amount: 50,
  type: 'expense',
  paymentMethod: 'debito',
  date: '2026-09-10',
  categoryId: 'lazer',
}

describe('serviço de transações (AC-003)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('busca todas as transações quando não há filtros', async () => {
    const transactions = await fetchTransactions()

    expect(transactions.length).toBe(seedTransactions.length)
  })

  it('envia os filtros como query string', async () => {
    const bySearch = await fetchTransactions({ search: 'merc' })
    expect(bySearch.length).toBeGreaterThan(0)
    expect(
      bySearch.every((item) => item.description.toLowerCase().includes('merc')),
    ).toBe(true)

    const byType = await fetchTransactions({ type: 'income' })
    expect(byType.every((item) => item.type === 'income')).toBe(true)
  })

  it('cria uma transação e a inclui na listagem', async () => {
    const created = await createTransaction(newTransaction)

    expect(created.id).toBeTruthy()
    expect(created.paymentMethod).toBe('debito')

    const transactions = await fetchTransactions({ search: 'Nova despesa' })
    expect(transactions.some((item) => item.id === created.id)).toBe(true)
  })

  it('atualiza uma transação existente', async () => {
    const updated = await updateTransaction('t1', {
      ...newTransaction,
      description: 'Atualizada via serviço',
    })

    expect(updated.id).toBe('t1')
    expect(updated.description).toBe('Atualizada via serviço')

    const transactions = await fetchTransactions()
    expect(transactions.find((item) => item.id === 't1')?.description).toBe(
      'Atualizada via serviço',
    )
  })

  it('remove uma transação e rejeita remoção repetida', async () => {
    await deleteTransaction('t30')

    const transactions = await fetchTransactions()
    expect(transactions.some((item) => item.id === 't30')).toBe(false)

    await expect(deleteTransaction('t30')).rejects.toMatchObject({
      response: { status: 404 },
    })
  })
})
