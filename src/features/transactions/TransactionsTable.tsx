import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryBadge } from '@/features/categories/CategoryBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import type { Category, Transaction, TransactionType } from '@/types'
import { transactionTypeOptions } from './schemas'

interface TransactionsTableProps {
  transactions: Transaction[]
  categories: Category[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

const typeLabelOf = (type: TransactionType) =>
  transactionTypeOptions.find((option) => option.value === type)?.label ?? type

const amountClassOf = (type: TransactionType) =>
  type === 'income' ? 'text-income' : 'text-expense'

const signedAmount = (transaction: Transaction) =>
  `${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}`

export function TransactionsTable({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const categoryOf = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)

  const renderCategory = (categoryId: string) => {
    const category = categoryOf(categoryId)

    return category ? (
      <CategoryBadge categoryId={category.id} name={category.name} />
    ) : (
      'Sem categoria'
    )
  }

  return (
    <div>
      <div className="hidden min-[720px]:block">
        <Table aria-label="Transações">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="odd:bg-muted/40">
                <TableCell className="whitespace-nowrap">
                  {formatDate(transaction.date)}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>{renderCategory(transaction.categoryId)}</TableCell>
                <TableCell>{typeLabelOf(transaction.type)}</TableCell>
                <TableCell className={amountClassOf(transaction.type)}>
                  {signedAmount(transaction)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(transaction)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => onDelete(transaction)}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul
        aria-label="Lista de transações (mobile)"
        className="space-y-3 min-[720px]:hidden"
      >
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            <Card>
              <CardContent className="space-y-3 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{transaction.description}</span>
                  <span
                    className={`whitespace-nowrap ${amountClassOf(transaction.type)}`}
                  >
                    {signedAmount(transaction)}
                  </span>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                  <dt>Data</dt>
                  <dd className="text-foreground">
                    {formatDate(transaction.date)}
                  </dd>
                  <dt>Categoria</dt>
                  <dd className="text-foreground">
                    {renderCategory(transaction.categoryId)}
                  </dd>
                  <dt>Tipo</dt>
                  <dd className="text-foreground">
                    {typeLabelOf(transaction.type)}
                  </dd>
                </dl>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(transaction)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive"
                    onClick={() => onDelete(transaction)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
