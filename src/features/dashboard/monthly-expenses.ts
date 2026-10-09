import { format, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Transaction } from '@/types'

export interface MonthlyExpensePoint {
  month: string
  label: string
  total: number
}

const round2 = (value: number) => Math.round(value * 100) / 100

export const buildMonthlyExpenses = (
  transactions: Transaction[],
  reference: Date = new Date(),
  months = 6,
): MonthlyExpensePoint[] => {
  const points: MonthlyExpensePoint[] = []

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = startOfMonth(subMonths(reference, offset))

    points.push({
      month: format(monthDate, 'yyyy-MM'),
      label: format(monthDate, 'MMM', { locale: ptBR }).replace('.', ''),
      total: 0,
    })
  }

  const indexByMonth = new Map(
    points.map((point, index) => [point.month, index]),
  )

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue

    const index = indexByMonth.get(transaction.date.slice(0, 7))
    if (index === undefined) continue

    const point = points[index]
    point.total = round2(point.total + transaction.amount)
  }

  return points
}
