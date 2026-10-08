import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Category, Transaction, TransactionInput } from '@/types'
import {
  paymentMethodOptions,
  transactionSchema,
  transactionTypeOptions,
  type TransactionFormData,
} from './schemas'

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

interface TransactionFormProps {
  open: boolean
  transaction?: Transaction | null
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onSubmit: (input: TransactionInput) => Promise<void> | void
  onSaveAndAddAnother?: (input: TransactionInput) => Promise<void> | void
}

export function TransactionForm({
  open,
  transaction = null,
  categories,
  onOpenChange,
  onSubmit,
  onSaveAndAddAnother,
}: TransactionFormProps) {
  const isEditing = Boolean(transaction)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { description: '', amount: '' },
  })

  useEffect(() => {
    if (!open) return

    if (transaction) {
      reset({
        description: transaction.description,
        amount: String(transaction.amount),
        type: transaction.type,
        categoryId: transaction.categoryId,
        paymentMethod: transaction.paymentMethod,
        date: transaction.date,
        repetition: 'none',
      })
    } else {
      reset()
    }
  }, [open, transaction, reset])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSubmitError(null)
    onOpenChange(nextOpen)
  }

  const toInput = (data: TransactionFormData): TransactionInput => ({
    description: data.description,
    amount: Number(data.amount.replace(',', '.')),
    type: data.type,
    paymentMethod: data.paymentMethod,
    date: data.date,
    categoryId: data.categoryId,
  })

  const handleSave = async (data: TransactionFormData) => {
    setSubmitError(null)

    try {
      await onSubmit(toInput(data))
      onOpenChange(false)
    } catch {
      setSubmitError('Não foi possível salvar a transação')
    }
  }

  const handleSaveAndAddAnother = async (data: TransactionFormData) => {
    setSubmitError(null)

    try {
      await onSaveAndAddAnother?.(toInput(data))
      reset()
    } catch {
      setSubmitError('Não foi possível salvar a transação')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar transação' : 'Nova transação'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da transação abaixo.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(handleSave)}
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="transaction-description"
              className="text-sm font-medium"
            >
              Descrição
            </label>
            <Input id="transaction-description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="transaction-amount"
                className="text-sm font-medium"
              >
                Valor (R$)
              </label>
              <Input
                id="transaction-amount"
                inputMode="decimal"
                placeholder="0,00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="transaction-date" className="text-sm font-medium">
                Data
              </label>
              <Input id="transaction-date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="transaction-type" className="text-sm font-medium">
                Tipo
              </label>
              <select
                id="transaction-type"
                className={selectClassName}
                defaultValue=""
                {...register('type')}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {transactionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="transaction-category"
                className="text-sm font-medium"
              >
                Categoria
              </label>
              <select
                id="transaction-category"
                className={selectClassName}
                defaultValue=""
                {...register('categoryId')}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="transaction-payment"
                className="text-sm font-medium"
              >
                Método de pagamento
              </label>
              <select
                id="transaction-payment"
                className={selectClassName}
                defaultValue=""
                {...register('paymentMethod')}
              >
                <option value="" disabled>
                  Selecione
                </option>
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-sm text-destructive">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="transaction-repetition"
                className="text-sm font-medium"
              >
                Repetição
              </label>
              <select
                id="transaction-repetition"
                className={selectClassName}
                {...register('repetition')}
              >
                <option value="none">Não repetir</option>
              </select>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>

            {!isEditing && (
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={handleSubmit(handleSaveAndAddAnother)}
              >
                Salvar e adicionar outra
              </Button>
            )}

            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
