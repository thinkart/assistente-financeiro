import { describe, expect, it } from 'vitest'
import { formatCurrency } from '@/utils/format'
import { buildSimpleSummary } from './summary'
import type { FinancialAnalysis } from './types'

// novembro/2026 → mês anterior usado nas frases: outubro
const referenceDate = new Date(2026, 10, 15)

const makeAnalysis = (
  overrides: Partial<FinancialAnalysis> = {},
): FinancialAnalysis => ({
  status: 'ready',
  tone: 'standard',
  current: {
    summary: { income: 5000, expense: 2400, balance: 2600 },
    expenseRatio: 48,
    categoryBreakdown: [],
    topExpenseCategory: {
      categoryId: 'moradia',
      categoryName: 'Moradia',
      total: 1512,
      percentage: 63,
    },
  },
  previous: null,
  comparison: {
    incomeChange: 500,
    incomeChangePercent: 11.11,
    expenseChange: 100,
    expenseChangePercent: 4.35,
    balanceChange: 400,
  },
  insights: [],
  statusMessage: null,
  ...overrides,
})

describe('buildSimpleSummary (modo Resumido)', () => {
  it('monta uma única mensagem simples e informal com os indicadores do mês', () => {
    const summary = buildSimpleSummary(makeAnalysis(), referenceDate)

    expect(typeof summary).toBe('string')
    expect(summary).not.toContain('\n')
    expect(summary).toContain('Resumo do mês')
    expect(summary).toContain(formatCurrency(5000))
    expect(summary).toContain(formatCurrency(2400))
    expect(summary).toContain(formatCurrency(2600))
    expect(summary).toContain('outubro')
    expect(summary).toContain('Atenção com Moradia')
    expect(summary).toContain('63%')
    expect(summary).toContain('Dica:')
  })

  it('usa a mensagem de status quando não há dados suficientes', () => {
    const analysis = makeAnalysis({
      status: 'no-transactions',
      statusMessage: 'Sua conta ainda não tem movimentações.',
    })

    expect(buildSimpleSummary(analysis, referenceDate)).toBe(
      'Sua conta ainda não tem movimentações.',
    )
  })

  it('avisa em linguagem simples quando o mês fecha no vermelho', () => {
    const summary = buildSimpleSummary(
      makeAnalysis({
        current: {
          summary: { income: 2000, expense: 2600, balance: -600 },
          expenseRatio: 130,
          categoryBreakdown: [],
          topExpenseCategory: null,
        },
        comparison: null,
      }),
      referenceDate,
    )

    expect(summary).toContain('no vermelho')
    expect(summary).toContain(formatCurrency(600))
    expect(summary).toContain('equilibrar as contas')
  })

  it('destaca a queda de receitas em relação ao mês anterior', () => {
    const summary = buildSimpleSummary(
      makeAnalysis({
        comparison: {
          incomeChange: -800,
          incomeChangePercent: -20,
          expenseChange: 0,
          expenseChangePercent: 0,
          balanceChange: -800,
        },
      }),
      referenceDate,
    )

    expect(summary).toContain('entrou')
    expect(summary).toContain(formatCurrency(800))
    expect(summary).toContain('a menos')
    expect(summary).toContain('outubro')
  })

  it('destaca a redução de despesas quando as receitas ficaram estáveis', () => {
    const summary = buildSimpleSummary(
      makeAnalysis({
        comparison: {
          incomeChange: 0,
          incomeChangePercent: 0,
          expenseChange: -300,
          expenseChangePercent: -15,
          balanceChange: 300,
        },
      }),
      referenceDate,
    )

    expect(summary).toContain('E o melhor')
    expect(summary).toContain(formatCurrency(300))
  })

  it('ignora a frase de comparação quando não há mês anterior', () => {
    const summary = buildSimpleSummary(
      makeAnalysis({ comparison: null }),
      referenceDate,
    )

    expect(summary).toContain('Resumo do mês')
    expect(summary).not.toContain('Comparado a')
  })

  it('não cita concentração de categoria quando o peso é pequeno', () => {
    const summary = buildSimpleSummary(
      makeAnalysis({
        current: {
          summary: { income: 5000, expense: 2400, balance: 2600 },
          expenseRatio: 48,
          categoryBreakdown: [],
          topExpenseCategory: {
            categoryId: 'lazer',
            categoryName: 'Lazer',
            total: 400,
            percentage: 16,
          },
        },
      }),
      referenceDate,
    )

    expect(summary).not.toContain('Atenção com')
  })

  it('descreve o zero a zero sem inventar saldo', () => {
    const summary = buildSimpleSummary(
      makeAnalysis({
        current: {
          summary: { income: 1000, expense: 1000, balance: 0 },
          expenseRatio: 100,
          categoryBreakdown: [],
          topExpenseCategory: null,
        },
        comparison: null,
      }),
      referenceDate,
    )

    expect(summary).toContain('zero a zero')
    expect(summary).toContain('manter o ritmo')
  })
})
