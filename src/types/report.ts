export interface SummaryReport {
  income: number
  expense: number
  balance: number
}

export interface CategoryReport {
  categoryId: string
  categoryName: string
  total: number
  percentage: number
}
