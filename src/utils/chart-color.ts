import type { TransactionType } from '@/types'

export const CHART_COLOR_VARS: Record<TransactionType, string> = {
  income: '--income',
  expense: '--expense',
}

export const resolveChartColor = (rawValue: string) =>
  rawValue.trim() ? `hsl(${rawValue.trim()})` : 'currentColor'

export const readChartColor = (type: TransactionType) =>
  resolveChartColor(
    getComputedStyle(document.documentElement).getPropertyValue(
      CHART_COLOR_VARS[type],
    ),
  )
