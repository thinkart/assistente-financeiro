import { useQuery } from '@tanstack/react-query'
import {
  fetchCategoryReport,
  type CategoryReportFilters,
} from '@/services/reports'

export const categoryReportQueryKey = (filters?: CategoryReportFilters) =>
  ['reports', 'by-category', filters ?? {}] as const

export const useCategoryReport = (filters?: CategoryReportFilters) =>
  useQuery({
    queryKey: categoryReportQueryKey(filters),
    queryFn: () => fetchCategoryReport(filters),
  })
