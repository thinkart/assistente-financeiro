import { format, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Transaction } from '@/types'

export interface MonthlySummaryPoint {
  month: string
  label: string
  income: number
  expense: number
  balance: number
}

const round2 = (value: number) => Math.round(value * 100) / 100

export const buildMonthlySummary = (
  transactions: Transaction[],
  reference: Date = new Date(),
  months = 6,
): MonthlySummaryPoint[] => {
  const points: MonthlySummaryPoint[] = []

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = startOfMonth(subMonths(reference, offset))

    points.push({
      month: format(monthDate, 'yyyy-MM'),
      label: format(monthDate, 'MMM', { locale: ptBR }).replace('.', ''),
      income: 0,
      expense: 0,
      balance: 0,
    })
  }

  const indexByMonth = new Map(
    points.map((point, index) => [point.month, index]),
  )

  for (const transaction of transactions) {
    const index = indexByMonth.get(transaction.date.slice(0, 7))
    if (index === undefined) continue

    const point = points[index]

    if (transaction.type === 'income') {
      point.income = round2(point.income + transaction.amount)
    } else {
      point.expense = round2(point.expense + transaction.amount)
    }
  }

  for (const point of points) {
    point.balance = round2(point.income - point.expense)
  }

  return points
}
