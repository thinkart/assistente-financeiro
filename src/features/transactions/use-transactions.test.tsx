import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { transactions as seedTransactions } from '@/mocks/data'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import type { TransactionInput } from '@/types'
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from './use-transactions'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const newTransaction: TransactionInput = {
  description: 'Nova despesa',
  amount: 50,
  type: 'expense',
  paymentMethod: 'debito',
  date: '2026-09-10',
  categoryId: 'lazer',
}

describe('hooks de transações (AC-003)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('useTransactions carrega a lista da API mockada', async () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toHaveLength(seedTransactions.length)
    })
  })

  it('useTransactions repassa os filtros para a query', async () => {
    const { result } = renderHook(() => useTransactions({ type: 'income' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.length).toBeGreaterThan(0)
    })

    expect(result.current.data?.every((item) => item.type === 'income')).toBe(
      true,
    )
  })

  it('useCreateTransaction cria e invalida o cache da lista', async () => {
    const { result } = renderHook(
      () => ({ list: useTransactions(), create: useCreateTransaction() }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.list.data).toHaveLength(seedTransactions.length)
    })

    await act(async () => {
      await result.current.create.mutateAsync(newTransaction)
    })

    await waitFor(() => {
      expect(result.current.list.data).toHaveLength(seedTransactions.length + 1)
    })
  })

  it('useUpdateTransaction atualiza e invalida o cache da lista', async () => {
    const { result } = renderHook(
      () => ({ list: useTransactions(), update: useUpdateTransaction() }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.list.data).toHaveLength(seedTransactions.length)
    })

    await act(async () => {
      await result.current.update.mutateAsync({
        id: 't1',
        input: { ...newTransaction, description: 'Editada via hook' },
      })
    })

    await waitFor(() => {
      expect(
        result.current.list.data?.find((item) => item.id === 't1')?.description,
      ).toBe('Editada via hook')
    })
  })

  it('useDeleteTransaction remove e invalida o cache da lista', async () => {
    const { result } = renderHook(
      () => ({ list: useTransactions(), remove: useDeleteTransaction() }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.list.data).toHaveLength(seedTransactions.length)
    })

    await act(async () => {
      await result.current.remove.mutateAsync('t30')
    })

    await waitFor(() => {
      expect(result.current.list.data?.some((item) => item.id === 't30')).toBe(
        false,
      )
    })
  })
})
