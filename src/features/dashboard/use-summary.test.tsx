import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { transactions as seedTransactions } from '@/mocks/data'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { useSummary } from './use-summary'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const round2 = (value: number) => Math.round(value * 100) / 100

const toIso = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('hook useSummary (AC-002)', () => {
  beforeEach(() => {
    resetTransactionStore()
  })

  it('carrega o resumo sem período', async () => {
    const { result } = renderHook(() => useSummary(), {
      wrapper: createWrapper(),
    })

    const expense = round2(
      seedTransactions
        .filter((item) => item.type === 'expense')
        .reduce((total, item) => total + item.amount, 0),
    )

    await waitFor(() => {
      expect(result.current.data?.expense).toBe(expense)
    })
  })

  it('repassa o período para a query', async () => {
    const today = new Date()
    const start = toIso(new Date(today.getFullYear(), today.getMonth() - 1, 1))

    const { result } = renderHook(() => useSummary({ startDate: start }), {
      wrapper: createWrapper(),
    })

    const expectedIncome = round2(
      seedTransactions
        .filter((item) => item.type === 'income' && item.date >= start)
        .reduce((total, item) => total + item.amount, 0),
    )

    await waitFor(() => {
      expect(result.current.data?.income).toBe(expectedIncome)
    })
  })
})
