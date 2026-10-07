import { authHandlers } from './auth'
import { categoryHandlers } from './categories'
import { reportHandlers } from './reports'
import { transactionHandlers } from './transactions'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...transactionHandlers,
  ...reportHandlers,
]
