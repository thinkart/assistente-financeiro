import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Transaction } from '@/types'

interface DeleteTransactionDialogProps {
  open: boolean
  transaction: Transaction | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
}

export function DeleteTransactionDialog({
  open,
  transaction,
  onOpenChange,
  onConfirm,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(null)
      setIsDeleting(false)
    }

    onOpenChange(nextOpen)
  }

  const handleConfirm = async () => {
    setSubmitError(null)
    setIsDeleting(true)

    try {
      await onConfirm()
      setIsDeleting(false)
      onOpenChange(false)
    } catch {
      setIsDeleting(false)
      setSubmitError('Não foi possível excluir a transação')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir transação</DialogTitle>
          <DialogDescription>
            {transaction
              ? `Tem certeza que deseja excluir "${transaction.description}"? Essa ação não pode ser desfeita.`
              : 'Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.'}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
