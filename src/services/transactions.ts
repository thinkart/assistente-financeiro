import type {
  ApiEnvelope,
  PaymentMethod,
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionType,
} from '@/types'
import { api } from './api'

interface ApiTransaction {
  id: string
  description: string
  amount: number | string
  type: TransactionType
  date: string
  payment_method: PaymentMethod
  category_id: string
}

interface ApiTransactionPayload {
  description: string
  amount: number
  type: TransactionType
  date: string
  payment_method: PaymentMethod
  category_id: string
}

const toTransaction = (transaction: ApiTransaction): Transaction => ({
  id: transaction.id,
  description: transaction.description,
  amount: Number(transaction.amount),
  type: transaction.type,
  date: transaction.date,
  paymentMethod: transaction.payment_method,
  categoryId: transaction.category_id,
})

const toPayload = (input: TransactionInput): ApiTransactionPayload => ({
  description: input.description,
  amount: input.amount,
  type: input.type,
  date: input.date,
  payment_method: input.paymentMethod,
  category_id: input.categoryId,
})

export const fetchTransactions = async (
  filters?: TransactionFilters,
): Promise<Transaction[]> => {
  const { data } = await api.get<ApiEnvelope<ApiTransaction[]>>(
    '/transactions',
    { params: filters },
  )

  return data.data.map(toTransaction)
}

export const createTransaction = async (
  input: TransactionInput,
): Promise<Transaction> => {
  const { data } = await api.post<ApiEnvelope<ApiTransaction>>(
    '/transactions',
    toPayload(input),
  )

  return toTransaction(data.data)
}

export const updateTransaction = async (
  id: string,
  input: TransactionInput,
): Promise<Transaction> => {
  const { data } = await api.put<ApiEnvelope<ApiTransaction>>(
    `/transactions/${id}`,
    toPayload(input),
  )

  return toTransaction(data.data)
}

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`)
}
