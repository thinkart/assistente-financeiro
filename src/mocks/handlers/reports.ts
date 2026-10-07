import { http, HttpResponse } from 'msw'
import type {
  CategoryReport,
  SummaryReport,
  Transaction,
  TransactionType,
} from '@/types'
import { applyMockDelay } from '../delay'
import { getCategoryById } from './categories'
import { getTransactions } from './transactions'

const round2 = (value: number) => Math.round(value * 100) / 100

const filterByPeriod = (
  items: Transaction[],
  startDate?: string,
  endDate?: string,
) =>
  items.filter((item) => {
    if (startDate && item.date < startDate) return false
    if (endDate && item.date > endDate) return false
    return true
  })

const sumByType = (items: Transaction[], type: TransactionType) =>
  round2(
    items
      .filter((item) => item.type === type)
      .reduce((total, item) => total + item.amount, 0),
  )

export const reportHandlers = [
  http.get('*/reports/summary', async ({ request }) => {
    await applyMockDelay()

    const url = new URL(request.url)
    const items = filterByPeriod(
      getTransactions(),
      url.searchParams.get('startDate') ?? undefined,
      url.searchParams.get('endDate') ?? undefined,
    )

    const income = sumByType(items, 'income')
    const expense = sumByType(items, 'expense')

    const summary: SummaryReport = {
      income,
      expense,
      balance: round2(income - expense),
    }

    return HttpResponse.json(summary)
  }),

  http.get('*/reports/by-category', async ({ request }) => {
    await applyMockDelay()

    const url = new URL(request.url)
    const type: TransactionType =
      url.searchParams.get('type') === 'income' ? 'income' : 'expense'

    const items = filterByPeriod(
      getTransactions().filter((item) => item.type === type),
      url.searchParams.get('startDate') ?? undefined,
      url.searchParams.get('endDate') ?? undefined,
    )

    const total = round2(items.reduce((sum, item) => sum + item.amount, 0))

    const totalsByCategory = new Map<string, number>()
    for (const item of items) {
      totalsByCategory.set(
        item.categoryId,
        (totalsByCategory.get(item.categoryId) ?? 0) + item.amount,
      )
    }

    const report: CategoryReport[] = [...totalsByCategory.entries()]
      .map(([categoryId, categoryTotal]) => {
        const roundedTotal = round2(categoryTotal)

        return {
          categoryId,
          categoryName: getCategoryById(categoryId)?.name ?? 'Sem categoria',
          total: roundedTotal,
          percentage: total === 0 ? 0 : round2((roundedTotal / total) * 100),
        }
      })
      .sort((a, b) => b.total - a.total)

    return HttpResponse.json(report)
  }),
]
