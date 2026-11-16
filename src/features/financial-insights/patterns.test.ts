import { describe, expect, it } from 'vitest'
import type { Category, Transaction } from '@/types'
import { analyzeFinances } from './analyze'
import { detectPatterns, detectRepeatedExpenses } from './patterns'
import { generateInsights } from './observations'
import { computeComparison, computeMonthlyIndicators } from './calculations'

const categories: Category[] = [
  { id: 'cat-salario', name: 'Salário', type: 'income' },
  { id: 'cat-moradia', name: 'Moradia', type: 'expense' },
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'expense' },
  { id: 'cat-lazer', name: 'Lazer', type: 'expense' },
]

describe('detectRepeatedExpenses', () => {
  it('detecta movimentações repetidas com valores semelhantes entre meses', () => {
    const current: Transaction[] = [
      {
        id: '1',
        description: 'Internet Fibra',
        amount: 110,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-11-05',
        categoryId: 'cat-moradia',
      },
    ]
    const previous: Transaction[] = [
      {
        id: '2',
        description: 'internet fibra',
        amount: 105,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-10-05',
        categoryId: 'cat-moradia',
      },
    ]

    const result = detectRepeatedExpenses(current, previous)
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Internet Fibra')
  })

  it('ignora quando a variação de valor é grande', () => {
    const current: Transaction[] = [
      {
        id: '1',
        description: 'Supermercado',
        amount: 500,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-11-05',
        categoryId: 'cat-alimentacao',
      },
    ]
    const previous: Transaction[] = [
      {
        id: '2',
        description: 'Supermercado',
        amount: 200,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-10-05',
        categoryId: 'cat-alimentacao',
      },
    ]

    const result = detectRepeatedExpenses(current, previous)
    expect(result).toHaveLength(0)
  })
})

describe('detectPatterns e generateInsights', () => {
  it('identifica saldo negativo e despesas superando receitas', () => {
    const current = computeMonthlyIndicators(
      [
        {
          id: '1',
          description: 'Salário',
          amount: 1000,
          type: 'income',
          paymentMethod: 'pix',
          date: '2026-11-01',
          categoryId: 'cat-salario',
        },
        {
          id: '2',
          description: 'Aluguel',
          amount: 1500,
          type: 'expense',
          paymentMethod: 'pix',
          date: '2026-11-02',
          categoryId: 'cat-moradia',
        },
      ],
      categories,
    )

    const patterns = detectPatterns(current, null, null, [], [])
    expect(patterns.some((p) => p.id === 'negative-balance')).toBe(true)
    expect(patterns.some((p) => p.id === 'expenses-exceed-income')).toBe(true)

    const insights = generateInsights('single-month', current, null, patterns)
    expect(
      insights.some((i) => i.message.includes('Revise as despesas')),
    ).toBe(true)
  })

  it('identifica crescimento expressivo de despesas e concentração de categoria', () => {
    const current = computeMonthlyIndicators(
      [
        {
          id: '1',
          description: 'Salário',
          amount: 3000,
          type: 'income',
          paymentMethod: 'pix',
          date: '2026-11-01',
          categoryId: 'cat-salario',
        },
        {
          id: '2',
          description: 'Aluguel',
          amount: 1200,
          type: 'expense',
          paymentMethod: 'pix',
          date: '2026-11-02',
          categoryId: 'cat-moradia',
        },
      ],
      categories,
    )

    const previous = computeMonthlyIndicators(
      [
        {
          id: '3',
          description: 'Salário',
          amount: 3000,
          type: 'income',
          paymentMethod: 'pix',
          date: '2026-10-01',
          categoryId: 'cat-salario',
        },
        {
          id: '4',
          description: 'Aluguel',
          amount: 800,
          type: 'expense',
          paymentMethod: 'pix',
          date: '2026-10-02',
          categoryId: 'cat-moradia',
        },
      ],
      categories,
    )

    const comparison = computeComparison(current.summary, previous.summary)
    const patterns = detectPatterns(current, previous, comparison, [], [])

    expect(patterns.some((p) => p.id === 'expense-growth')).toBe(true)
    expect(patterns.some((p) => p.id === 'category-concentration')).toBe(true)
  })
})

describe('analyzeFinances - Cenários de dados insuficientes e estados da conta', () => {
  const refDate = new Date('2026-11-14T12:00:00Z')

  it('retorna no-transactions quando não há movimentações', () => {
    const analysis = analyzeFinances([], categories, refDate)
    expect(analysis.status).toBe('no-transactions')
    expect(analysis.statusMessage).toContain('ainda não tem movimentações')
    expect(analysis.insights).toHaveLength(0)
  })

  it('retorna income-only quando há apenas receitas (mais de uma transação)', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        description: 'Salário',
        amount: 2500,
        type: 'income',
        paymentMethod: 'pix',
        date: '2026-11-05',
        categoryId: 'cat-salario',
      },
      {
        id: '2',
        description: 'Rendimento',
        amount: 100,
        type: 'income',
        paymentMethod: 'pix',
        date: '2026-11-06',
        categoryId: 'cat-salario',
      },
    ]
    const analysis = analyzeFinances(txs, categories, refDate)
    expect(analysis.status).toBe('income-only')
    expect(analysis.statusMessage).toContain('Apenas receitas')
  })

  it('retorna expense-only quando há apenas despesas (mais de uma transação)', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        description: 'Mercado',
        amount: 400,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-11-05',
        categoryId: 'cat-alimentacao',
      },
      {
        id: '2',
        description: 'Farmácia',
        amount: 80,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-11-06',
        categoryId: 'cat-alimentacao',
      },
    ]
    const analysis = analyzeFinances(txs, categories, refDate)
    expect(analysis.status).toBe('expense-only')
    expect(analysis.statusMessage).toContain('Apenas despesas')
  })

  it('retorna single-month quando não há histórico do mês anterior para comparar', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        description: 'Salário',
        amount: 3000,
        type: 'income',
        paymentMethod: 'pix',
        date: '2026-11-01',
        categoryId: 'cat-salario',
      },
    ]
    const analysis = analyzeFinances(txs, categories, refDate)
    expect(analysis.status).toBe('single-month')
    expect(analysis.comparison).toBeNull()
    expect(analysis.statusMessage).toContain('Ainda não há dados dos dois períodos')
  })

  it('retorna ready com comparação completa quando há dados suficientes em ambos os meses', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        description: 'Salário',
        amount: 3000,
        type: 'income',
        paymentMethod: 'pix',
        date: '2026-11-01',
        categoryId: 'cat-salario',
      },
      {
        id: '2',
        description: 'Mercado',
        amount: 500,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-11-05',
        categoryId: 'cat-alimentacao',
      },
      {
        id: '3',
        description: 'Salário Outubro',
        amount: 2800,
        type: 'income',
        paymentMethod: 'pix',
        date: '2026-10-01',
        categoryId: 'cat-salario',
      },
      {
        id: '4',
        description: 'Mercado Outubro',
        amount: 600,
        type: 'expense',
        paymentMethod: 'pix',
        date: '2026-10-05',
        categoryId: 'cat-alimentacao',
      },
    ]
    const analysis = analyzeFinances(txs, categories, refDate)
    expect(analysis.status).toBe('ready')
    expect(analysis.statusMessage).toBeNull()
    expect(analysis.comparison).not.toBeNull()
    expect(analysis.insights.length).toBeGreaterThan(0)
  })
})
