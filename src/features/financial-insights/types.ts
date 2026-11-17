import type { SummaryReport } from '@/types'

export type AnalysisTone = 'simple' | 'standard' | 'detailed'

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  total: number
  percentage: number
}

export interface MonthlyIndicators {
  summary: SummaryReport
  expenseRatio: number
  categoryBreakdown: CategoryBreakdown[]
  topExpenseCategory: CategoryBreakdown | null
}

export interface MonthlyComparison {
  incomeChange: number
  incomeChangePercent: number
  expenseChange: number
  expenseChangePercent: number
  balanceChange: number
}

export type InsightKind = 'positive' | 'attention' | 'recommendation'

export interface Insight {
  kind: InsightKind
  message: string
}

export type DataStatus =
  | 'no-transactions'
  | 'income-only'
  | 'expense-only'
  | 'single-month'
  | 'ready'

export interface FinancialAnalysis {
  status: DataStatus
  tone: AnalysisTone
  current: MonthlyIndicators
  previous: MonthlyIndicators | null
  comparison: MonthlyComparison | null
  insights: Insight[]
  statusMessage: string | null
}
