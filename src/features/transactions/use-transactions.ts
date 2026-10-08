import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '@/services/transactions'
import type { TransactionFilters, TransactionInput } from '@/types'

export const transactionsQueryKey = (filters?: TransactionFilters) =>
  ['transactions', filters ?? {}] as const

export const useTransactions = (filters?: TransactionFilters) =>
  useQuery({
    queryKey: transactionsQueryKey(filters),
    queryFn: () => fetchTransactions(filters),
  })

const useInvalidateTransactions = () => {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
}

export const useCreateTransaction = () => {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: invalidate,
  })
}

export const useUpdateTransaction = () => {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      updateTransaction(id, input),
    onSuccess: invalidate,
  })
}

export const useDeleteTransaction = () => {
  const invalidate = useInvalidateTransactions()

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: invalidate,
  })
}
