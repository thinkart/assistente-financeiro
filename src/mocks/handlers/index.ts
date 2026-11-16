import { authHandlers } from './auth'
import { categoryHandlers } from './categories'
import { reportHandlers } from './reports'
import { transactionHandlers } from './transactions'
import { assistantHandlers } from './assistant'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...transactionHandlers,
  ...reportHandlers,
  ...assistantHandlers,
]
