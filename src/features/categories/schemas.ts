import { z } from 'zod'
import type { TransactionType } from '@/types'

export const categoryTypeOptions: {
  value: TransactionType
  label: string
}[] = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
]

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da categoria'),
  type: z.enum(['income', 'expense'], { message: 'Selecione o tipo' }),
})

export type CategoryFormData = z.infer<typeof categorySchema>
