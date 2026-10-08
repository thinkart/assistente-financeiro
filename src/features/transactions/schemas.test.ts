import { describe, expect, it } from 'vitest'
import {
  paymentMethodOptions,
  transactionSchema,
  transactionTypeOptions,
} from './schemas'

interface ParseLike {
  success: boolean
  error?: { issues: Array<{ message: string }> }
}

const messagesOf = (result: ParseLike) =>
  result.success
    ? []
    : (result.error?.issues.map((issue) => issue.message) ?? [])

const validForm = {
  description: 'Mercado',
  amount: '99,90',
  type: 'expense',
  categoryId: 'alimentacao',
  paymentMethod: 'debito',
  date: '2026-10-01',
  repetition: 'none',
}

describe('schema do formulário de transação (AC-008)', () => {
  it('aceita dados válidos com valor em vírgula ou ponto', () => {
    expect(transactionSchema.safeParse(validForm).success).toBe(true)
    expect(
      transactionSchema.safeParse({ ...validForm, amount: '99.90' }).success,
    ).toBe(true)
  })

  it('exige descrição', () => {
    const result = transactionSchema.safeParse({
      ...validForm,
      description: '  ',
    })

    expect(messagesOf(result)).toContain('Informe a descrição')
  })

  it('exige valor maior que zero', () => {
    expect(
      messagesOf(transactionSchema.safeParse({ ...validForm, amount: '0' })),
    ).toContain('Informe um valor maior que zero')
    expect(
      messagesOf(transactionSchema.safeParse({ ...validForm, amount: 'abc' })),
    ).toContain('Informe um valor maior que zero')
    expect(
      messagesOf(transactionSchema.safeParse({ ...validForm, amount: '' })),
    ).toContain('Informe o valor')
  })

  it('exige tipo, categoria e método válidos', () => {
    expect(
      messagesOf(transactionSchema.safeParse({ ...validForm, type: '' })),
    ).toContain('Selecione o tipo')
    expect(
      messagesOf(transactionSchema.safeParse({ ...validForm, categoryId: '' })),
    ).toContain('Selecione a categoria')
    expect(
      messagesOf(
        transactionSchema.safeParse({ ...validForm, paymentMethod: 'cheque' }),
      ),
    ).toContain('Selecione o método de pagamento')
  })

  it('valida a data no formato ISO', () => {
    expect(
      messagesOf(transactionSchema.safeParse({ ...validForm, date: '' })),
    ).toContain('Informe a data')
    expect(
      messagesOf(
        transactionSchema.safeParse({ ...validForm, date: '15/09/2026' }),
      ),
    ).toContain('Informe uma data válida')
  })

  it('aceita apenas a repetição "Não repetir" por enquanto', () => {
    expect(
      messagesOf(
        transactionSchema.safeParse({ ...validForm, repetition: 'monthly' }),
      ),
    ).toContain('Repetição ainda não suportada')
  })

  it('exporta as opções de tipo e método com rótulos em pt-BR', () => {
    expect(transactionTypeOptions).toEqual([
      { value: 'income', label: 'Receita' },
      { value: 'expense', label: 'Despesa' },
    ])
    expect(paymentMethodOptions.map((option) => option.label)).toEqual([
      'Pix',
      'Crédito',
      'Débito',
      'Dinheiro',
      'Boleto',
    ])
  })
})
