import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Category, CategoryInput } from '@/types'
import {
  categorySchema,
  categoryTypeOptions,
  type CategoryFormData,
} from './schemas'

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

interface CategoryFormProps {
  open: boolean
  category?: Category | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CategoryInput) => Promise<void> | void
}

export function CategoryForm({
  open,
  category = null,
  onOpenChange,
  onSubmit,
}: CategoryFormProps) {
  const isEditing = Boolean(category)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!open) return

    if (category) {
      reset({ name: category.name, type: category.type })
    } else {
      reset()
    }
  }, [open, category, reset])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSubmitError(null)
    onOpenChange(nextOpen)
  }

  const handleSave = async (data: CategoryFormData) => {
    setSubmitError(null)

    try {
      await onSubmit({ name: data.name, type: data.type })
      onOpenChange(false)
    } catch {
      setSubmitError('Não foi possível salvar a categoria')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da categoria abaixo.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(handleSave)}
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="category-name" className="text-sm font-medium">
              Nome
            </label>
            <Input id="category-name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="category-type" className="text-sm font-medium">
              Tipo
            </label>
            <select
              id="category-type"
              className={selectClassName}
              defaultValue=""
              {...register('type')}
            >
              <option value="" disabled>
                Selecione
              </option>
              {categoryTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

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
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
