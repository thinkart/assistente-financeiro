import { z } from 'zod'
import type { PaymentMethod, TransactionType } from '@/types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const transactionTypeOptions: {
  value: TransactionType
  label: string
}[] = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
]

export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'credito', label: 'Crédito' },
  { value: 'debito', label: 'Débito' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'boleto', label: 'Boleto' },
]

export const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Informe a descrição'),
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor')
    .refine((value) => {
      const parsed = Number(value.replace(',', '.'))
      return Number.isFinite(parsed) && parsed > 0
    }, 'Informe um valor maior que zero'),
  type: z.enum(['income', 'expense'], { message: 'Selecione o tipo' }),
  categoryId: z.string().min(1, 'Selecione a categoria'),
  paymentMethod: z.enum(['pix', 'credito', 'debito', 'dinheiro', 'boleto'], {
    message: 'Selecione o método de pagamento',
  }),
  date: z
    .string()
    .min(1, 'Informe a data')
    .refine((value) => ISO_DATE.test(value), 'Informe uma data válida'),
  repetition: z.literal('none', { message: 'Repetição ainda não suportada' }),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
