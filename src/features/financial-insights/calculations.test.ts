import { describe, expect, it } from 'vitest'
import type { Category, Transaction } from '@/types'
import {
  summarize,
  computeExpenseRatio,
  computeCategoryBreakdown,
  computeMonthlyIndicators,
  computeComparison,
} from './calculations'

const tx = (
  overrides: Partial<Transaction> & { amount: number; type: 'income' | 'expense' },
): Transaction => ({
  id: `tx-${Math.random()}`,
  description: 'Transação',
  paymentMethod: 'pix',
  date: '2026-11-01',
  categoryId: 'cat-1',
  ...overrides,
})

const categories: Category[] = [
  { id: 'cat-1', name: 'Alimentação', type: 'expense' },
  { id: 'cat-2', name: 'Moradia', type: 'expense' },
  { id: 'cat-3', name: 'Salário', type: 'income' },
]

describe('summarize', () => {
  it('calcula receitas, despesas e saldo corretamente', () => {
    const transactions = [
      tx({ amount: 1000, type: 'income' }),
      tx({ amount: 500, type: 'income' }),
      tx({ amount: 300, type: 'expense' }),
      tx({ amount: 200, type: 'expense' }),
    ]

    const result = summarize(transactions)

    expect(result.income).toBe(1500)
    expect(result.expense).toBe(500)
    expect(result.balance).toBe(1000)
  })

  it('retorna zeros para lista vazia', () => {
    const result = summarize([])

    expect(result.income).toBe(0)
    expect(result.expense).toBe(0)
    expect(result.balance).toBe(0)
  })

  it('calcula saldo negativo quando despesas excedem receitas', () => {
    const transactions = [
      tx({ amount: 200, type: 'income' }),
      tx({ amount: 800, type: 'expense' }),
    ]

    const result = summarize(transactions)

    expect(result.balance).toBe(-600)
  })

  it('calcula corretamente apenas com receitas', () => {
    const transactions = [tx({ amount: 1000, type: 'income' })]

    const result = summarize(transactions)

    expect(result.income).toBe(1000)
    expect(result.expense).toBe(0)
    expect(result.balance).toBe(1000)
  })

  it('calcula corretamente apenas com despesas', () => {
    const transactions = [tx({ amount: 500, type: 'expense' })]

    const result = summarize(transactions)

    expect(result.income).toBe(0)
    expect(result.expense).toBe(500)
    expect(result.balance).toBe(-500)
  })
})

describe('computeExpenseRatio', () => {
  it('calcula percentual das receitas comprometido com despesas', () => {
    expect(computeExpenseRatio({ income: 1000, expense: 600, balance: 400 })).toBe(60)
  })

  it('retorna 0 quando receita e despesa são zero', () => {
    expect(computeExpenseRatio({ income: 0, expense: 0, balance: 0 })).toBe(0)
  })

  it('retorna 100 quando há despesas mas sem receitas', () => {
    expect(computeExpenseRatio({ income: 0, expense: 500, balance: -500 })).toBe(100)
  })

  it('pode exceder 100 quando despesas superam receitas', () => {
    expect(computeExpenseRatio({ income: 500, expense: 750, balance: -250 })).toBe(150)
  })

  it('mantém precisão de duas casas decimais', () => {
    expect(computeExpenseRatio({ income: 3000, expense: 1000, balance: 2000 })).toBe(
      33.33,
    )
  })
})

describe('computeCategoryBreakdown', () => {
  it('calcula participação percentual de cada categoria de despesas', () => {
    const transactions = [
      tx({ amount: 300, type: 'expense', categoryId: 'cat-1' }),
      tx({ amount: 200, type: 'expense', categoryId: 'cat-1' }),
      tx({ amount: 500, type: 'expense', categoryId: 'cat-2' }),
    ]

    const result = computeCategoryBreakdown(transactions, categories, 'expense')

    expect(result).toHaveLength(2)
    expect(result[0].categoryId).toBe('cat-2')
    expect(result[0].total).toBe(500)
    expect(result[0].percentage).toBe(50)
    expect(result[1].categoryId).toBe('cat-1')
    expect(result[1].total).toBe(500)
    expect(result[1].percentage).toBe(50)
  })

  it('retorna array vazio quando não há transações do tipo', () => {
    const transactions = [tx({ amount: 1000, type: 'income', categoryId: 'cat-3' })]

    const result = computeCategoryBreakdown(transactions, categories, 'expense')

    expect(result).toEqual([])
  })

  it('ordena por valor decrescente', () => {
    const transactions = [
      tx({ amount: 100, type: 'expense', categoryId: 'cat-1' }),
      tx({ amount: 900, type: 'expense', categoryId: 'cat-2' }),
    ]

    const result = computeCategoryBreakdown(transactions, categories, 'expense')

    expect(result[0].categoryName).toBe('Moradia')
    expect(result[0].total).toBe(900)
    expect(result[0].percentage).toBe(90)
  })

  it('usa o id quando a categoria não está na lista', () => {
    const transactions = [
      tx({ amount: 100, type: 'expense', categoryId: 'desconhecida' }),
    ]

    const result = computeCategoryBreakdown(transactions, [], 'expense')

    expect(result[0].categoryName).toBe('desconhecida')
  })
})

describe('computeMonthlyIndicators', () => {
  it('combina resumo, ratio, breakdown e top categoria', () => {
    const transactions = [
      tx({ amount: 1000, type: 'income', categoryId: 'cat-3' }),
      tx({ amount: 600, type: 'expense', categoryId: 'cat-1' }),
      tx({ amount: 200, type: 'expense', categoryId: 'cat-2' }),
    ]

    const result = computeMonthlyIndicators(transactions, categories)

    expect(result.summary.income).toBe(1000)
    expect(result.summary.expense).toBe(800)
    expect(result.summary.balance).toBe(200)
    expect(result.expenseRatio).toBe(80)
    expect(result.categoryBreakdown).toHaveLength(2)
    expect(result.topExpenseCategory?.categoryId).toBe('cat-1')
    expect(result.topExpenseCategory?.total).toBe(600)
  })

  it('retorna topExpenseCategory null quando não há despesas', () => {
    const transactions = [tx({ amount: 1000, type: 'income', categoryId: 'cat-3' })]

    const result = computeMonthlyIndicators(transactions, categories)

    expect(result.topExpenseCategory).toBeNull()
  })
})

describe('computeComparison', () => {
  it('calcula variações entre meses', () => {
    const current = { income: 1200, expense: 800, balance: 400 }
    const previous = { income: 1000, expense: 600, balance: 400 }

    const result = computeComparison(current, previous)

    expect(result.incomeChange).toBe(200)
    expect(result.incomeChangePercent).toBe(20)
    expect(result.expenseChange).toBe(200)
    expect(result.expenseChangePercent).toBeCloseTo(33.33, 1)
    expect(result.balanceChange).toBe(0)
  })

  it('trata mês anterior sem receita como 100% de crescimento', () => {
    const current = { income: 500, expense: 0, balance: 500 }
    const previous = { income: 0, expense: 0, balance: 0 }

    const result = computeComparison(current, previous)

    expect(result.incomeChangePercent).toBe(100)
  })

  it('calcula redução de despesas corretamente', () => {
    const current = { income: 1000, expense: 400, balance: 600 }
    const previous = { income: 1000, expense: 800, balance: 200 }

    const result = computeComparison(current, previous)

    expect(result.expenseChange).toBe(-400)
    expect(result.expenseChangePercent).toBe(-50)
    expect(result.balanceChange).toBe(400)
  })
})
