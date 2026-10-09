import { useQuery } from '@tanstack/react-query'
import { fetchSummary, type SummaryPeriod } from '@/services/reports'

export const summaryQueryKey = (period?: SummaryPeriod) =>
  ['reports', 'summary', period ?? {}] as const

export const useSummary = (period?: SummaryPeriod) =>
  useQuery({
    queryKey: summaryQueryKey(period),
    queryFn: () => fetchSummary(period),
  })
