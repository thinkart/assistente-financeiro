import type { PaymentMethod, Transaction } from '@/types'

interface TransactionTemplate {
  monthsAgo: number
  day: number
  description: string
  amount: number
  type: Transaction['type']
  categoryId: string
}

const toIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateFor = (monthsAgo: number, day: number) => {
  const today = new Date()
  const safeDay = monthsAgo === 0 ? Math.min(day, today.getDate()) : day
  return toIsoDate(
    new Date(today.getFullYear(), today.getMonth() - monthsAgo, safeDay),
  )
}

const templates: TransactionTemplate[] = [
  {
    monthsAgo: 0,
    day: 5,
    description: 'Salário',
    amount: 5200,
    type: 'income',
    categoryId: 'salario',
  },
  {
    monthsAgo: 0,
    day: 10,
    description: 'Aluguel',
    amount: 1500,
    type: 'expense',
    categoryId: 'moradia',
  },
  {
    monthsAgo: 0,
    day: 14,
    description: 'Supermercado',
    amount: 432.9,
    type: 'expense',
    categoryId: 'alimentacao',
  },
  {
    monthsAgo: 0,
    day: 18,
    description: 'Uber',
    amount: 186.4,
    type: 'expense',
    categoryId: 'transporte',
  },
  {
    monthsAgo: 0,
    day: 22,
    description: 'Cinema',
    amount: 74.5,
    type: 'expense',
    categoryId: 'lazer',
  },
  {
    monthsAgo: 1,
    day: 5,
    description: 'Salário',
    amount: 5200,
    type: 'income',
    categoryId: 'salario',
  },
  {
    monthsAgo: 1,
    day: 10,
    description: 'Aluguel',
    amount: 1500,
    type: 'expense',
    categoryId: 'moradia',
  },
  {
    monthsAgo: 1,
    day: 12,
    description: 'Supermercado',
    amount: 388.7,
    type: 'expense',
    categoryId: 'alimentacao',
  },
  {
    monthsAgo: 1,
    day: 19,
    description: 'Combustível',
    amount: 221.3,
    type: 'expense',
    categoryId: 'transporte',
  },
  {
    monthsAgo: 1,
    day: 24,
    description: 'Farmácia',
    amount: 96.8,
    type: 'expense',
    categoryId: 'saude',
  },
  {
    monthsAgo: 2,
    day: 8,
    description: 'Projeto freelance',
    amount: 1800,
    type: 'income',
    categoryId: 'freelance',
  },
  {
    monthsAgo: 2,
    day: 10,
    description: 'Aluguel',
    amount: 1500,
    type: 'expense',
    categoryId: 'moradia',
  },
  {
    monthsAgo: 2,
    day: 15,
    description: 'Supermercado',
    amount: 512.4,
    type: 'expense',
    categoryId: 'alimentacao',
  },
  {
    monthsAgo: 2,
    day: 18,
    description: 'Passagens de ônibus',
    amount: 168.0,
    type: 'expense',
    categoryId: 'transporte',
  },
  {
    monthsAgo: 2,
    day: 26,
    description: 'Curso online',
    amount: 249.9,
    type: 'expense',
    categoryId: 'educacao',
  },
  {
    monthsAgo: 3,
    day: 5,
    description: 'Salário',
    amount: 5200,
    type: 'income',
    categoryId: 'salario',
  },
  {
    monthsAgo: 3,
    day: 10,
    description: 'Aluguel',
    amount: 1500,
    type: 'expense',
    categoryId: 'moradia',
  },
  {
    monthsAgo: 3,
    day: 13,
    description: 'Supermercado',
    amount: 465.2,
    type: 'expense',
    categoryId: 'alimentacao',
  },
  {
    monthsAgo: 3,
    day: 17,
    description: 'Combustível',
    amount: 198.6,
    type: 'expense',
    categoryId: 'transporte',
  },
  {
    monthsAgo: 3,
    day: 23,
    description: 'Streaming',
    amount: 55.8,
    type: 'expense',
    categoryId: 'lazer',
  },
  {
    monthsAgo: 4,
    day: 5,
    description: 'Salário',
    amount: 5200,
    type: 'income',
    categoryId: 'salario',
  },
  {
    monthsAgo: 4,
    day: 10,
    description: 'Aluguel',
    amount: 1500,
    type: 'expense',
    categoryId: 'moradia',
  },
  {
    monthsAgo: 4,
    day: 16,
    description: 'Supermercado',
    amount: 401.5,
    type: 'expense',
    categoryId: 'alimentacao',
  },
  {
    monthsAgo: 4,
    day: 20,
    description: 'Uber',
    amount: 142.7,
    type: 'expense',
    categoryId: 'transporte',
  },
  {
    monthsAgo: 4,
    day: 25,
    description: 'Show',
    amount: 160.0,
    type: 'expense',
    categoryId: 'lazer',
  },
  {
    monthsAgo: 5,
    day: 7,
    description: 'Projeto freelance',
    amount: 950,
    type: 'income',
    categoryId: 'freelance',
  },
  {
    monthsAgo: 5,
    day: 10,
    description: 'Aluguel',
    amount: 1500,
    type: 'expense',
    categoryId: 'moradia',
  },
  {
    monthsAgo: 5,
    day: 11,
    description: 'Supermercado',
    amount: 376.3,
    type: 'expense',
    categoryId: 'alimentacao',
  },
  {
    monthsAgo: 5,
    day: 21,
    description: 'Combustível',
    amount: 210.9,
    type: 'expense',
    categoryId: 'transporte',
  },
  {
    monthsAgo: 5,
    day: 27,
    description: 'Dentista',
    amount: 320.0,
    type: 'expense',
    categoryId: 'saude',
  },
]

const paymentByCategory: Record<string, PaymentMethod> = {
  salario: 'pix',
  freelance: 'pix',
  alimentacao: 'credito',
  transporte: 'pix',
  moradia: 'boleto',
  lazer: 'credito',
  saude: 'debito',
  educacao: 'credito',
}

export const transactions: Transaction[] = templates.map((template, index) => ({
  id: `t${index + 1}`,
  description: template.description,
  amount: template.amount,
  type: template.type,
  paymentMethod: paymentByCategory[template.categoryId] ?? 'pix',
  date: dateFor(template.monthsAgo, template.day),
  categoryId: template.categoryId,
}))
