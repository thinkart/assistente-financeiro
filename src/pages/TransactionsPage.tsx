import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DeleteTransactionDialog } from '@/features/transactions/DeleteTransactionDialog'
import { FiltersBar } from '@/features/transactions/FiltersBar'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { TransactionsTable } from '@/features/transactions/TransactionsTable'
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '@/features/transactions/use-transactions'
import { fetchCategories } from '@/services/categories'
import type { Transaction, TransactionFilters, TransactionInput } from '@/types'

const PAGE_SIZE = 10

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const {
    data: transactions = [],
    isPending,
    isError,
    refetch,
  } = useTransactions(filters)

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [transactions, currentPage])

  const handleApplyFilters = (nextFilters: TransactionFilters) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const handleOpenCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (transaction: Transaction) => {
    setEditing(transaction)
    setFormOpen(true)
  }

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditing(null)
  }

  const persist = async (input: TransactionInput) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input })
        toast.success('Transação atualizada!')
      } else {
        await createMutation.mutateAsync(input)
        toast.success('Transação criada!')
      }
    } catch (error) {
      toast.error('Não foi possível salvar a transação')
      throw error
    }
  }

  const persistAnother = async (input: TransactionInput) => {
    try {
      await createMutation.mutateAsync(input)
      toast.success('Transação criada!')
    } catch (error) {
      toast.error('Não foi possível salvar a transação')
      throw error
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Transação excluída!')
    } catch (error) {
      toast.error('Não foi possível excluir a transação')
      throw error
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Transações cadastradas
        </h2>
        <Button type="button" onClick={handleOpenCreate}>
          + Nova transação
        </Button>
      </div>

      <FiltersBar categories={categories} onApply={handleApplyFilters} />

      {isPending && (
        <p
          role="status"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          Carregando transações…
        </p>
      )}

      {isError && (
        <div className="space-y-3 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar as transações.
          </p>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isPending && !isError && transactions.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma transação encontrada.
        </p>
      )}

      {!isPending && !isError && transactions.length > 0 && (
        <div className="space-y-4">
          <TransactionsTable
            transactions={pageItems}
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
          />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <TransactionForm
        open={formOpen}
        transaction={editing}
        categories={categories}
        onOpenChange={handleFormOpenChange}
        onSubmit={persist}
        onSaveAndAddAnother={persistAnother}
      />

      <DeleteTransactionDialog
        open={Boolean(deleteTarget)}
        transaction={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
