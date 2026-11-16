import { http, HttpResponse } from 'msw'
import { jsPDF } from 'jspdf'
import type { CategoryReport, SummaryReport, TransactionType } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'
import { applyMockDelay } from '../delay'
import { getAuthenticatedUserId } from './auth'
import { getCategoryById } from './categories'
import { getFilteredTransactions, getTransactions } from './transactions'
import { errorResponse } from './responses'

const round2 = (value: number) => Math.round(value * 100) / 100

const isTransactionType = (value: string | null): value is TransactionType =>
  value === 'income' || value === 'expense'

const filterByPeriod = (
  userId: string,
  startDate: string | null,
  endDate: string | null,
) =>
  getTransactions(userId).filter((transaction) => {
    if (startDate && transaction.date < startDate) return false
    if (endDate && transaction.date > endDate) return false
    return true
  })

const paymentMethodLabels = {
  pix: 'Pix',
  credito: 'Crédito',
  debito: 'Débito',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
} as const

const transactionTypeLabels = {
  income: 'Receita',
  expense: 'Despesa',
} as const

const createTransactionsPdf = (transactions: ReturnType<typeof getTransactions>, userId: string) => {
  const document = new jsPDF({ orientation: 'landscape' })
  const columns = [
    { title: 'Data', x: 14, width: 25 },
    { title: 'Descrição', x: 42, width: 96 },
    { title: 'Tipo', x: 141, width: 25 },
    { title: 'Categoria', x: 170, width: 42 },
    { title: 'Pagamento', x: 215, width: 33 },
    { title: 'Valor', x: 252, width: 30 },
  ]
  const pageBottom = document.internal.pageSize.getHeight() - 14

  const drawPageHeader = () => {
    document.setFont('helvetica', 'bold')
    document.setFontSize(15)
    document.text('Relatório Financeiro', 14, 17)
    document.setFontSize(8)
    columns.forEach((column) => document.text(column.title, column.x, 29))
    document.setDrawColor(180)
    document.line(14, 32, 283, 32)
    document.setFont('helvetica', 'normal')
    document.setFontSize(9)
  }

  document.setProperties({
    title: 'Relatório Financeiro',
    subject: 'Transações financeiras',
  })
  drawPageHeader()

  if (transactions.length === 0) {
    document.text('Não existem transações no período.', 14, 42)
  } else {
    let y = 39

    for (const transaction of transactions) {
      const values = [
        formatDate(transaction.date),
        transaction.description,
        transactionTypeLabels[transaction.type],
        getCategoryById(transaction.categoryId, userId)?.name ?? 'Sem categoria',
        paymentMethodLabels[transaction.paymentMethod],
        formatCurrency(transaction.amount),
      ]
      const lines = values.map((value, index) =>
        document.splitTextToSize(value, columns[index].width),
      )
      const rowHeight = Math.max(...lines.map((value) => value.length)) * 5 + 3

      if (y + rowHeight > pageBottom) {
        document.addPage()
        drawPageHeader()
        y = 39
      }

      lines.forEach((value, index) => document.text(value, columns[index].x, y))
      y += rowHeight
    }
  }

  return new Uint8Array(document.output('arraybuffer'))
}

export const reportHandlers = [
  http.get('*/reports/summary', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const url = new URL(request.url)
    const transactions = filterByPeriod(
      userId,
      url.searchParams.get('startDate'),
      url.searchParams.get('endDate'),
    )

    const income = round2(
      transactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0),
    )
    const expense = round2(
      transactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0),
    )

    const summary: SummaryReport = {
      income,
      expense,
      balance: round2(income - expense),
    }

    return HttpResponse.json({ data: summary })
  }),

  http.get('*/reports/by-category', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const url = new URL(request.url)
    const typeParam = url.searchParams.get('type')
    const type = isTransactionType(typeParam) ? typeParam : 'expense'

    const transactions = filterByPeriod(
      userId,
      url.searchParams.get('startDate'),
      url.searchParams.get('endDate'),
    ).filter((transaction) => transaction.type === type)

    const totalByCategory = new Map<string, number>()
    let total = 0

    for (const transaction of transactions) {
      totalByCategory.set(
        transaction.categoryId,
        (totalByCategory.get(transaction.categoryId) ?? 0) +
          transaction.amount,
      )
      total += transaction.amount
    }

    const roundedTotal = round2(total)

    const report: CategoryReport[] = [...totalByCategory.entries()]
      .map(([categoryId, categoryTotal]) => {
        const roundedCategoryTotal = round2(categoryTotal)

        return {
          categoryId,
          categoryName:
            getCategoryById(categoryId, userId)?.name ?? 'Sem categoria',
          total: roundedCategoryTotal,
          percentage:
            roundedTotal === 0
              ? 0
              : round2((roundedCategoryTotal / roundedTotal) * 100),
        }
      })
      .sort((a, b) => b.total - a.total)

    return HttpResponse.json({ data: report })
  }),

  http.get('*/reports/transactions-pdf', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const url = new URL(request.url)
    const transactions = getFilteredTransactions(userId, url.searchParams)

    return new HttpResponse(createTransactionsPdf(transactions, userId), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relatorio-financeiro.pdf"',
      },
    })
  }),
]
