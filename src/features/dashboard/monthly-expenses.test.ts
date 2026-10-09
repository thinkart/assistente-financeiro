import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/types'
import { buildMonthlyExpenses } from './monthly-expenses'

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

describe('agregação mensal de despesas (AC-004)', () => {
  it('gera os últimos 6 meses em ordem, com zeros quando não há despesas', () => {
    const points = buildMonthlyExpenses([], reference)

    expect(points.map((point) => point.month)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
    ])
    expect(points.every((point) => point.total === 0)).toBe(true)
    expect(points[5]?.label).toBe('out')
  })

  it('soma apenas despesas dentro da janela de meses', () => {
    const points = buildMonthlyExpenses(
      [
        transaction({ amount: 100, type: 'expense', date: '2026-10-05' }),
        transaction({ amount: 50.5, type: 'expense', date: '2026-10-20' }),
        transaction({ amount: 5000, type: 'income', date: '2026-10-05' }),
        transaction({ amount: 200, type: 'expense', date: '2026-08-10' }),
        transaction({ amount: 999, type: 'expense', date: '2025-01-01' }),
      ],
      reference,
    )

    const byMonth = new Map(points.map((point) => [point.month, point.total]))

    expect(byMonth.get('2026-10')).toBe(150.5)
    expect(byMonth.get('2026-08')).toBe(200)
    expect(byMonth.get('2026-09')).toBe(0)
    expect(byMonth.get('2026-05')).toBe(0)
  })

  it('usa a data atual como referência por padrão', () => {
    const points = buildMonthlyExpenses([])

    expect(points).toHaveLength(6)
    expect(points[5]?.month).toBe(format(new Date(), 'yyyy-MM'))
  })
})
