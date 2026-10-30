import { authHandlers } from './auth'
import { categoryHandlers } from './categories'
import { transactionHandlers } from './transactions'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...transactionHandlers,
]
