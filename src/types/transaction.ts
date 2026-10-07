export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  type?: TransactionType
  minAmount?: number
  maxAmount?: number
}
