import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from './use-categories'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('hooks de categorias (AC-003)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('useCategories carrega a lista da API mockada', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data?.length).toBeGreaterThanOrEqual(6)
    })
  })

  it('useCreateCategory cria e invalida o cache da lista', async () => {
    const { result } = renderHook(
      () => ({ list: useCategories(), create: useCreateCategory() }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.list.data?.length).toBeGreaterThanOrEqual(6)
    })

    await act(async () => {
      await result.current.create.mutateAsync({ name: 'Pets', type: 'expense' })
    })

    await waitFor(() => {
      expect(
        result.current.list.data?.some((category) => category.name === 'Pets'),
      ).toBe(true)
    })
  })

  it('useUpdateCategory atualiza e invalida o cache da lista', async () => {
    const { result } = renderHook(
      () => ({ list: useCategories(), update: useUpdateCategory() }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.list.data?.length).toBeGreaterThanOrEqual(6)
    })

    await act(async () => {
      await result.current.update.mutateAsync({
        id: 'lazer',
        input: { name: 'Lazer e hobbies', type: 'expense' },
      })
    })

    await waitFor(() => {
      expect(
        result.current.list.data?.find((category) => category.id === 'lazer')
          ?.name,
      ).toBe('Lazer e hobbies')
    })
  })

  it('useDeleteCategory remove e invalida o cache da lista', async () => {
    const { result } = renderHook(
      () => ({
        list: useCategories(),
        create: useCreateCategory(),
        remove: useDeleteCategory(),
      }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.list.data?.length).toBeGreaterThanOrEqual(6)
    })

    let createdId = ''
    await act(async () => {
      const created = await result.current.create.mutateAsync({
        name: 'Temporária',
        type: 'expense',
      })
      createdId = created.id
    })

    await act(async () => {
      await result.current.remove.mutateAsync(createdId)
    })

    await waitFor(() => {
      expect(
        result.current.list.data?.some((category) => category.id === createdId),
      ).toBe(false)
    })
  })
})
