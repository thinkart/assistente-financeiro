import { beforeEach, describe, expect, it } from 'vitest'
import { transactions as seedTransactions } from '@/mocks/data'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { fetchCategoryReport, fetchSummary } from './reports'

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

describe('serviço de relatórios por categoria (AC-002)', () => {
  beforeEach(() => {
    resetTransactionStore()
    resetCategoryStore()
  })

  it('busca o relatório de despesas por categoria por padrão', async () => {
    const report = await fetchCategoryReport()

    const expenseItems = seedTransactions.filter(
      (item) => item.type === 'expense',
    )
    const expectedAlimentacao = round2(
      expenseItems
        .filter((item) => item.categoryId === 'alimentacao')
        .reduce((total, item) => total + item.amount, 0),
    )

    const alimentacao = report.find((item) => item.categoryId === 'alimentacao')
    expect(alimentacao?.total).toBeCloseTo(expectedAlimentacao, 2)
    expect(alimentacao?.categoryName).toBe('Alimentação')

    const percentageSum = round2(
      report.reduce((total, item) => total + item.percentage, 0),
    )
    expect(Math.abs(percentageSum - 100)).toBeLessThan(0.5)
  })

  it('filtra por período e tipo (receitas)', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 1, 1))

    const report = await fetchCategoryReport({
      startDate: start,
      type: 'income',
    })

    const incomeItems = seedTransactions.filter(
      (item) => item.type === 'income' && item.date >= start,
    )
    const expectedSalario = round2(
      incomeItems
        .filter((item) => item.categoryId === 'salario')
        .reduce((total, item) => total + item.amount, 0),
    )

    expect(
      report.find((item) => item.categoryId === 'salario')?.total,
    ).toBeCloseTo(expectedSalario, 2)
    expect(report.every((item) => item.categoryId !== 'alimentacao')).toBe(true)
  })
})
