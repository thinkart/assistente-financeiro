import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import { useCategoryReport } from './use-category-report'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('hook useCategoryReport (AC-002)', () => {
  beforeEach(() => {
    resetTransactionStore()
    resetCategoryStore()
  })

  it('carrega o relatório de despesas por categoria', async () => {
    const { result } = renderHook(() => useCategoryReport(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.length).toBeGreaterThan(0)
    })

    expect(
      result.current.data?.some((item) => item.categoryId === 'alimentacao'),
    ).toBe(true)
  })

  it('repassa os filtros de tipo e período', async () => {
    const { result } = renderHook(() => useCategoryReport({ type: 'income' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.length).toBeGreaterThan(0)
    })

    expect(
      result.current.data?.some((item) => item.categoryId === 'salario'),
    ).toBe(true)
    expect(
      result.current.data?.every((item) => item.categoryId !== 'alimentacao'),
    ).toBe(true)
  })
})
