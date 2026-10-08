import type { TransactionType } from './transaction'

export interface Category {
  id: string
  name: string
  type: TransactionType
}

export type CategoryInput = Omit<Category, 'id'>
