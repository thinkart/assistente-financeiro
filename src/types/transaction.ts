export type TransactionType = 'income' | 'expense'

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro' | 'boleto'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  paymentMethod: PaymentMethod
  date: string
  categoryId: string
}

export interface TransactionFilters {
  search?: string
  startDate?: string
  endDate?: string
  categoryId?: string
  type?: TransactionType
  minAmount?: number
  maxAmount?: number
}
