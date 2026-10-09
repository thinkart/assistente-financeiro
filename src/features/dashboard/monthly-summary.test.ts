import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { buildMonthlySummary } from './monthly-summary'

const reference = new Date(2026, 9, 8)

const transaction = (
  overrides: Partial<Transaction> &
    Pick<Transaction, 'amount' | 'type' | 'date'>,
): Transaction => ({
  id: `t-${overrides.date}-${overrides.amount}`,
  description: 'Fixture',
  paymentMethod: 'pix',
  categoryId: 'alimentacao',
  ...overrides,
})

describe('agregação mensal do resumo financeiro (AC-002)', () => {
  it('gera os últimos 6 meses em ordem, zerados quando não há transações', () => {
    const points = buildMonthlySummary([], reference)

    expect(points.map((point) => point.month)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ])
    expect(
      points.every(
        (point) =>
          point.income === 0 && point.expense === 0 && point.balance === 0,
      ),
    ).toBe(true)
    expect(points[5]?.label).toBe('out')
  })

  it('soma receitas e despesas por mês e calcula o saldo do mês', () => {
    const points = buildMonthlySummary(
      [
        transaction({ amount: 5000, type: 'income', date: '2026-10-05' }),
        transaction({ amount: 100.55, type: 'income', date: '2026-10-20' }),
        transaction({ amount: 150.5, type: 'expense', date: '2026-10-10' }),
        transaction({ amount: 300, type: 'income', date: '2026-08-01' }),
        transaction({ amount: 200.5, type: 'expense', date: '2026-08-15' }),
      ],
      reference,
    )

    const byMonth = new Map(points.map((point) => [point.month, point]))

    expect(byMonth.get('2026-10')).toEqual({
      month: '2026-10',
      label: 'out',
      income: 5100.55,
      expense: 150.5,
      balance: 4950.05,
    })
    expect(byMonth.get('2026-08')).toEqual({
      month: '2026-08',
      label: 'ago',
      income: 300,
      expense: 200.5,
      balance: 99.5,
    })
    expect(byMonth.get('2026-09')).toEqual({
      month: '2026-09',
      label: 'set',
      income: 0,
      expense: 0,
      balance: 0,
    })
  })

  it('ignora transações fora da janela de meses', () => {
    const points = buildMonthlySummary(
      [transaction({ amount: 999, type: 'income', date: '2025-01-01' })],
      reference,
    )

    expect(points.every((point) => point.income === 0)).toBe(true)
  })

  it('usa a data atual como referência por padrão', () => {
    const points = buildMonthlySummary([])

    expect(points).toHaveLength(6)
    expect(points[5]?.month).toBe(format(new Date(), 'yyyy-MM'))
  })
})
