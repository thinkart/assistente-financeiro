import type { Category } from '@/types'

export const categories: Category[] = [
  { id: 'salario', name: 'Salário', type: 'income' },
  { id: 'freelance', name: 'Freelance', type: 'income' },
  { id: 'alimentacao', name: 'Alimentação', type: 'expense' },
  { id: 'transporte', name: 'Transporte', type: 'expense' },
  { id: 'moradia', name: 'Moradia', type: 'expense' },
  { id: 'lazer', name: 'Lazer', type: 'expense' },
  { id: 'saude', name: 'Saúde', type: 'expense' },
  { id: 'educacao', name: 'Educação', type: 'expense' },
]
