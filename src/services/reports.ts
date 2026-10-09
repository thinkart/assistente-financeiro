import type { SummaryReport } from '@/types'
import { api } from './api'

export interface SummaryPeriod {
  startDate?: string
  endDate?: string
}

export const fetchSummary = async (
  period?: SummaryPeriod,
): Promise<SummaryReport> => {
  const { data } = await api.get<SummaryReport>('/reports/summary', {
    params: period,
  })

  return data
}
