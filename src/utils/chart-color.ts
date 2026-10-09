import type { TransactionType } from '@/types'

export type SummaryChartColorKey = 'income' | 'expense' | 'balance'

export const CHART_COLOR_VARS: Record<TransactionType, string> = {
  income: '--income',
  expense: '--expense',
}

export const SUMMARY_CHART_COLOR_VARS: Record<SummaryChartColorKey, string> = {
  income: '--chart-income',
  expense: '--chart-expense',
  balance: '--chart-balance',
}

export const resolveChartColor = (rawValue: string) =>
  rawValue.trim() ? `hsl(${rawValue.trim()})` : 'currentColor'

export const readChartColor = (type: TransactionType) =>
  resolveChartColor(
    getComputedStyle(document.documentElement).getPropertyValue(
      CHART_COLOR_VARS[type],
    ),
  )

export const readSummaryChartColor = (key: SummaryChartColorKey) =>
  resolveChartColor(
    getComputedStyle(document.documentElement).getPropertyValue(
      SUMMARY_CHART_COLOR_VARS[key],
    ),
  )
