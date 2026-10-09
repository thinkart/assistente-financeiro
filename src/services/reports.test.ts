import { beforeEach, describe, expect, it } from 'vitest'
import { transactions as seedTransactions } from '@/mocks/data'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { fetchSummary } from './reports'

const round2 = (value: number) => Math.round(value * 100) / 100

const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const expectedSummary = (items: typeof seedTransactions) => {
  const income = round2(
    items
      .filter((item) => item.type === 'income')
      .reduce((total, item) => total + item.amount, 0),
  )
  const expense = round2(
    items
      .filter((item) => item.type === 'expense')
      .reduce((total, item) => total + item.amount, 0),
  )

  return { income, expense, balance: round2(income - expense) }
}

describe('serviço de relatórios (AC-002)', () => {
  beforeEach(() => {
    resetTransactionStore()
  })

  it('busca o resumo completo quando não há período', async () => {
    const summary = await fetchSummary()

    expect(summary).toEqual(expectedSummary(seedTransactions))
  })

  it('envia o período como query string', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 2, 1))

    const summary = await fetchSummary({ startDate: start })

    expect(summary).toEqual(
      expectedSummary(seedTransactions.filter((item) => item.date >= start)),
    )
  })
})
