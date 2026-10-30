import type { CategoryReport, SummaryReport, TransactionType } from '@/types'
import { fetchCategories } from './categories'
import { fetchTransactions } from './transactions'

export interface SummaryPeriod {
  startDate?: string
  endDate?: string
}

export interface CategoryReportFilters {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

const round2 = (value: number) => Math.round(value * 100) / 100

export const fetchSummary = async (
  period?: SummaryPeriod,
): Promise<SummaryReport> => {
  const transactions = await fetchTransactions(period)

  const income = round2(
    transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0),
  )
  const expense = round2(
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0),
  )

  return { income, expense, balance: round2(income - expense) }
}

export const fetchCategoryReport = async (
  filters?: CategoryReportFilters,
): Promise<CategoryReport[]> => {
  const type = filters?.type ?? 'expense'

  const [transactions, categories] = await Promise.all([
    fetchTransactions({
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      type,
    }),
    fetchCategories(),
  ])

  const nameByCategoryId = new Map(
    categories.map((category) => [category.id, category.name]),
  )

  const totalByCategory = new Map<string, number>()
  let total = 0

  for (const transaction of transactions) {
    totalByCategory.set(
      transaction.categoryId,
      (totalByCategory.get(transaction.categoryId) ?? 0) + transaction.amount,
    )
    total += transaction.amount
  }

  const roundedTotal = round2(total)

  return [...totalByCategory.entries()]
    .map(([categoryId, categoryTotal]) => {
      const roundedCategoryTotal = round2(categoryTotal)

      return {
        categoryId,
        categoryName: nameByCategoryId.get(categoryId) ?? 'Sem categoria',
        total: roundedCategoryTotal,
        percentage:
          roundedTotal === 0
            ? 0
            : round2((roundedCategoryTotal / roundedTotal) * 100),
      }
    })
    .sort((a, b) => b.total - a.total)
}
