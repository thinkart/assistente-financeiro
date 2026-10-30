import { useQuery } from '@tanstack/react-query'
import {
  fetchCategoryReport,
  type CategoryReportFilters,
} from '@/services/reports'
import { reportsQueryKey } from './query-keys'

export const categoryReportQueryKey = (filters?: CategoryReportFilters) =>
  [...reportsQueryKey, 'by-category', filters ?? {}] as const

export const useCategoryReport = (filters?: CategoryReportFilters) =>
  useQuery({
    queryKey: categoryReportQueryKey(filters),
    queryFn: () => fetchCategoryReport(filters),
  })
