import type {
  ApiEnvelope,
  CategoryReport,
  SummaryReport,
  TransactionFilters,
  TransactionType,
} from '@/types'
import { api } from './api'
import { fetchCategories } from './categories'
import { fetchTransactions } from './transactions'
import { formatDate } from '@/utils/format'

export interface SummaryPeriod {
  startDate?: string
  endDate?: string
}

export interface CategoryReportFilters {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

interface ApiCategoryReport {
  category_id: string
  category_name: string
  total: number
  percentage: number
}

const toCategoryReport = (report: ApiCategoryReport): CategoryReport => ({
  categoryId: report.category_id,
  categoryName: report.category_name,
  total: Number(report.total),
  percentage: Number(report.percentage),
})

export interface TransactionsPdfFilters {
  startDate?: string
  endDate?: string
  type?: TransactionType
  categoryId?: string
  search?: string
  minAmount?: number
  maxAmount?: number
}

export interface DownloadResult {
  blob: Blob
  filename: string
}

const filenameFromDisposition = (disposition: string | undefined) => {
  if (!disposition) return null

  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)

  return match ? decodeURIComponent(match[1]) : null
}

export const fetchSummary = async (
  period?: SummaryPeriod,
): Promise<SummaryReport> => {
  const { data } = await api.get<ApiEnvelope<SummaryReport>>(
    '/reports/summary',
    {
      params: {
        startDate: period?.startDate,
        endDate: period?.endDate,
      },
    },
  )

  return data.data
}

export const fetchCategoryReport = async (
  filters?: CategoryReportFilters,
): Promise<CategoryReport[]> => {
  const { data } = await api.get<ApiEnvelope<ApiCategoryReport[]>>(
    '/reports/by-category',
    {
      params: {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        type: filters?.type,
      },
    },
  )

  return Array.isArray(data.data) ? data.data.map(toCategoryReport) : []
}

export const downloadTransactionsPdf = async (
  filters?: TransactionsPdfFilters,
): Promise<DownloadResult> => {
  const response = await api.get<ArrayBuffer>('/reports/transactions-pdf', {
    params: filters,
    responseType: 'arraybuffer',
  })

  return {
    blob: new Blob([response.data], { type: 'application/pdf' }),
    filename:
      filenameFromDisposition(response.headers['content-disposition']) ??
      'transacoes.pdf',
  }
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
}

const paymentMethodLabels = {
  pix: 'Pix',
  credito: 'Crédito',
  debito: 'Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
} as const

const csvCell = (value: string) => {
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safeValue.replace(/"/g, '""')}"`
}

export const downloadTransactionsCsv = async (
  filters?: TransactionFilters,
): Promise<DownloadResult> => {
  const [transactions, categories] = await Promise.all([
    fetchTransactions(filters),
    fetchCategories(),
  ])
  const rows = [
    [
      'Data',
      'Descrição',
      'Tipo',
      'Categoria',
      'Forma de pagamento',
      'Valor (R$)',
    ],
    ...transactions.map((transaction) => [
      formatDate(transaction.date),
      transaction.description,
      typeLabels[transaction.type],
      categories.find((category) => category.id === transaction.categoryId)
        ?.name ?? 'Sem categoria',
      paymentMethodLabels[transaction.paymentMethod],
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(transaction.amount),
    ]),
  ]
  const content = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`

  return {
    blob: new Blob([content], { type: 'text/csv;charset=utf-8' }),
    filename: 'relatorio-financeiro.csv',
  }
}
