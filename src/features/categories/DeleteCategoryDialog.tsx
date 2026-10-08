import axios from 'axios'
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
import type { Category } from '@/types'

interface DeleteCategoryDialogProps {
  open: boolean
  category: Category | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
}

export function DeleteCategoryDialog({
  open,
  category,
  onOpenChange,
  onConfirm,
}: DeleteCategoryDialogProps) {
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
    } catch (error) {
      setIsDeleting(false)

      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
          ? error.response.data.message
          : 'Não foi possível excluir a categoria'

      setSubmitError(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir categoria</DialogTitle>
          <DialogDescription>
            {category
              ? `Tem certeza que deseja excluir "${category.name}"? Essa ação não pode ser desfeita.`
              : 'Tem certeza que deseja excluir esta categoria? Essa ação não pode ser desfeita.'}
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
