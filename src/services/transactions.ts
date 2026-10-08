import type { Transaction, TransactionFilters, TransactionInput } from '@/types'
import { api } from './api'

export const fetchTransactions = async (
  filters?: TransactionFilters,
): Promise<Transaction[]> => {
  const { data } = await api.get<Transaction[]>('/transactions', {
    params: filters,
  })

  return data
}

export const createTransaction = async (
  input: TransactionInput,
): Promise<Transaction> => {
  const { data } = await api.post<Transaction>('/transactions', input)

  return data
}

export const updateTransaction = async (
  id: string,
  input: TransactionInput,
): Promise<Transaction> => {
  const { data } = await api.put<Transaction>(`/transactions/${id}`, input)

  return data
}

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`)
}
