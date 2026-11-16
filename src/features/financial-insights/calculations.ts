import type { Category, SummaryReport, Transaction } from '@/types'
import type { CategoryBreakdown, MonthlyComparison, MonthlyIndicators } from './types'

export const summarize = (transactions: Transaction[]): SummaryReport => {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return { income, expense, balance: income - expense }
}

export const computeExpenseRatio = (summary: SummaryReport): number =>
  summary.income > 0
    ? Math.round((summary.expense / summary.income) * 10000) / 100
    : summary.expense > 0
      ? 100
      : 0

export const computeCategoryBreakdown = (
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
): CategoryBreakdown[] => {
  const totals = new Map<string, number>()

  for (const t of transactions) {
    if (t.type === type) {
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
    }
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0)
  if (grandTotal === 0) return []

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  return [...totals.entries()]
    .sort((a, b) => {
      const diff = b[1] - a[1]
      if (diff !== 0) return diff
      return b[0].localeCompare(a[0])
    })
    .map(([categoryId, total]) => ({
      categoryId,
      categoryName: categoryMap.get(categoryId) ?? categoryId,
      total,
      percentage: Math.round((total / grandTotal) * 10000) / 100,
    }))
}

export const computeMonthlyIndicators = (
  transactions: Transaction[],
  categories: Category[],
): MonthlyIndicators => {
  const summary = summarize(transactions)
  const expenseRatio = computeExpenseRatio(summary)
  const categoryBreakdown = computeCategoryBreakdown(
    transactions,
    categories,
    'expense',
  )
  const topExpenseCategory = categoryBreakdown[0] ?? null

  return { summary, expenseRatio, categoryBreakdown, topExpenseCategory }
}

export const computeComparison = (
  current: SummaryReport,
  previous: SummaryReport,
): MonthlyComparison => {
  const incomeChange = current.income - previous.income
  const incomeChangePercent =
    previous.income > 0
      ? Math.round((incomeChange / previous.income) * 10000) / 100
      : current.income > 0
        ? 100
        : 0

  const expenseChange = current.expense - previous.expense
  const expenseChangePercent =
    previous.expense > 0
      ? Math.round((expenseChange / previous.expense) * 10000) / 100
      : current.expense > 0
        ? 100
        : 0

  const balanceChange = current.balance - previous.balance

  return {
    incomeChange,
    incomeChangePercent,
    expenseChange,
    expenseChangePercent,
    balanceChange,
  }
}
