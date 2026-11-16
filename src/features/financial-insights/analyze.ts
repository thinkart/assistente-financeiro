import { addMonths, format, startOfMonth, subMonths } from 'date-fns'
import type { Category, Transaction } from '@/types'
import { computeComparison, computeMonthlyIndicators } from './calculations'
import { generateInsights, getStatusMessage } from './observations'
import { detectPatterns } from './patterns'
import type { DataStatus, FinancialAnalysis } from './types'

export const analyzeFinances = (
  transactions: Transaction[],
  categories: Category[],
  referenceDate: Date = new Date(),
): FinancialAnalysis => {
  const currentMonthStart = format(startOfMonth(referenceDate), 'yyyy-MM-dd')
  const nextMonthStart = format(
    startOfMonth(addMonths(referenceDate, 1)),
    'yyyy-MM-dd',
  )
  const previousMonthStart = format(
    startOfMonth(subMonths(referenceDate, 1)),
    'yyyy-MM-dd',
  )

  const currentTransactions = transactions.filter(
    (t) => t.date >= currentMonthStart && t.date < nextMonthStart,
  )
  const previousTransactions = transactions.filter(
    (t) => t.date >= previousMonthStart && t.date < currentMonthStart,
  )

  const status = determineStatus(transactions, currentTransactions, previousTransactions)
  const current = computeMonthlyIndicators(currentTransactions, categories)
  const hasPrevious = previousTransactions.length > 0
  const previous = hasPrevious
    ? computeMonthlyIndicators(previousTransactions, categories)
    : null
  const comparison =
    previous && status === 'ready'
      ? computeComparison(current.summary, previous.summary)
      : null

  const patterns =
    status === 'ready' || status === 'single-month'
      ? detectPatterns(
          current,
          previous,
          comparison,
          currentTransactions,
          previousTransactions,
        )
      : []

  const insights = generateInsights(status, current, comparison, patterns)
  const statusMessage = getStatusMessage(status)

  return {
    status,
    tone: 'standard',
    current,
    previous,
    comparison,
    insights,
    statusMessage,
  }
}

const determineStatus = (
  all: Transaction[],
  current: Transaction[],
  previous: Transaction[],
): DataStatus => {
  if (all.length === 0) return 'no-transactions'

  const hasIncome = all.some((t) => t.type === 'income')
  const hasExpense = all.some((t) => t.type === 'expense')

  if (hasIncome && !hasExpense && all.length > 1) return 'income-only'
  if (hasExpense && !hasIncome && all.length > 1) return 'expense-only'

  if (current.length === 0 || previous.length === 0) {
    if (hasIncome && !hasExpense && current.length > 1) return 'income-only'
    if (hasExpense && !hasIncome && current.length > 1) return 'expense-only'
    return 'single-month'
  }

  if (hasIncome && !hasExpense) return 'income-only'
  if (hasExpense && !hasIncome) return 'expense-only'

  return 'ready'
}
