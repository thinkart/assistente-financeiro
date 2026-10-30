import { useQuery } from '@tanstack/react-query'
import { fetchSummary, type SummaryPeriod } from '@/services/reports'
import { reportsQueryKey } from '@/features/reports/query-keys'

export const summaryQueryKey = (period?: SummaryPeriod) =>
  [...reportsQueryKey, 'summary', period ?? {}] as const

export const useSummary = (period?: SummaryPeriod) =>
  useQuery({
    queryKey: summaryQueryKey(period),
    queryFn: () => fetchSummary(period),
  })
