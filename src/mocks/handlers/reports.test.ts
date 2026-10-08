import { beforeEach, describe, expect, it } from 'vitest'
import type { CategoryReport, SummaryReport, Transaction } from '@/types'
import { transactions as seedTransactions } from '../data'
import { resetCategoryStore } from './categories'
import { resetTransactionStore } from './transactions'

const API_URL = 'http://127.0.0.1:5000'

const round2 = (value: number) => Math.round(value * 100) / 100

const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getJson = async <T>(path: string) => {
  const response = await fetch(`${API_URL}${path}`)
  return { response, body: (await response.json()) as T }
}

const expectedSummary = (items: Transaction[]): SummaryReport => {
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

describe('handlers de relatórios (AC-007)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('calcula o summary do período completo', async () => {
    const { response, body } = await getJson<SummaryReport>('/reports/summary')

    expect(response.status).toBe(200)
    expect(body).toEqual(expectedSummary(seedTransactions))
  })

  it('respeita o período no summary', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 2, 1))

    const { body } = await getJson<SummaryReport>(
      `/reports/summary?startDate=${start}`,
    )

    expect(body).toEqual(
      expectedSummary(seedTransactions.filter((item) => item.date >= start)),
    )
  })

  it('gera o relatório por categoria de despesas com percentuais', async () => {
    const { response, body } = await getJson<CategoryReport[]>(
      '/reports/by-category',
    )

    expect(response.status).toBe(200)

    const expenseItems = seedTransactions.filter(
      (item) => item.type === 'expense',
    )
    const expenseTotal = round2(
      expenseItems.reduce((total, item) => total + item.amount, 0),
    )

    const alimentacao = body.find((item) => item.categoryId === 'alimentacao')
    expect(alimentacao).toBeDefined()

    const expectedTotal = round2(
      expenseItems
        .filter((item) => item.categoryId === 'alimentacao')
        .reduce((total, item) => total + item.amount, 0),
    )
    expect(alimentacao?.total).toBeCloseTo(expectedTotal, 2)
    expect(alimentacao?.percentage).toBeCloseTo(
      (expectedTotal / expenseTotal) * 100,
      1,
    )

    const totals = body.map((item) => item.total)
    expect([...totals].sort((a, b) => b - a)).toEqual(totals)

    for (const item of body) {
      expect(item.categoryName.length).toBeGreaterThan(0)
    }
  })

  it('filtra o relatório por categoria pelo período', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 1, 1))

    const { body } = await getJson<CategoryReport[]>(
      `/reports/by-category?startDate=${start}`,
    )

    const expectedTotal = round2(
      seedTransactions
        .filter((item) => item.type === 'expense' && item.date >= start)
        .reduce((total, item) => total + item.amount, 0),
    )
    const totalSum = round2(body.reduce((total, item) => total + item.total, 0))

    expect(totalSum).toBeCloseTo(expectedTotal, 2)
  })

  it('gera o relatório de entradas com type=income', async () => {
    const { body } = await getJson<CategoryReport[]>(
      '/reports/by-category?type=income',
    )

    expect(body.some((item) => item.categoryId === 'salario')).toBe(true)
    expect(body.every((item) => item.categoryId !== 'alimentacao')).toBe(true)
  })

  it('reflete transações criadas no summary', async () => {
    const before = await getJson<SummaryReport>('/reports/summary')

    const createResponse = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Despesa extra',
        amount: 100,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-09-20',
        categoryId: 'lazer',
      }),
    })
    expect(createResponse.status).toBe(201)

    const after = await getJson<SummaryReport>('/reports/summary')

    expect(after.body.expense).toBeCloseTo(before.body.expense + 100, 2)
    expect(after.body.balance).toBeCloseTo(before.body.balance - 100, 2)
  })
})
