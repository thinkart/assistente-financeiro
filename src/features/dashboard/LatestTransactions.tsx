import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'

interface LatestTransactionsProps {
  transactions: Transaction[]
  limit?: number
}

const amountClassOf = (type: Transaction['type']) =>
  type === 'income' ? 'text-income' : 'text-expense'

const signedAmount = (transaction: Transaction) =>
  `${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}`

export function LatestTransactions({
  transactions,
  limit = 5,
}: LatestTransactionsProps) {
  const latest = transactions.slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Últimas transações
        </CardTitle>
        <Link
          to="/transacoes"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {latest.length === 0 ? (
          <p
            role="status"
            className="py-6 text-center text-sm text-muted-foreground"
          >
            Nenhuma transação encontrada.
          </p>
        ) : (
          <>
            <div className="hidden min-[720px]:block">
              <Table aria-label="Últimas transações">
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.map((transaction) => (
                    <TableRow key={transaction.id} className="odd:bg-muted/40">
                      <TableCell className="whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell
                        className={`text-right ${amountClassOf(transaction.type)}`}
                      >
                        {signedAmount(transaction)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <ul
              aria-label="Últimas transações (mobile)"
              className="min-[720px]:hidden"
            >
              {latest.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span
                    className={`whitespace-nowrap ${amountClassOf(transaction.type)}`}
                  >
                    {signedAmount(transaction)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
