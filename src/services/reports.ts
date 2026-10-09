import type { CategoryReport, SummaryReport, TransactionType } from '@/types'
import { api } from './api'

export interface SummaryPeriod {
  startDate?: string
  endDate?: string
}

export interface CategoryReportFilters {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

export const fetchSummary = async (
  period?: SummaryPeriod,
): Promise<SummaryReport> => {
  const { data } = await api.get<SummaryReport>('/reports/summary', {
    params: period,
  })

  return data
}

export const fetchCategoryReport = async (
  filters?: CategoryReportFilters,
): Promise<CategoryReport[]> => {
  const { data } = await api.get<CategoryReport[]>('/reports/by-category', {
    params: filters,
  })

  return data
}
