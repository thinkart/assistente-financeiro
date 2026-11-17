import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NoCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoToCategories: () => void
}

export function NoCategoriesDialog({
  open,
  onOpenChange,
  onGoToCategories,
}: NoCategoriesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nenhuma categoria cadastrada</DialogTitle>
          <DialogDescription>
            Cadastre pelo menos uma categoria antes de cadastrar uma transação
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onGoToCategories}>
            Ir para categorias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
