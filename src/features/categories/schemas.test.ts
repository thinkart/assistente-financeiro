import { describe, expect, it } from 'vitest'
import { categorySchema, categoryTypeOptions } from './schemas'

interface ParseLike {
  success: boolean
  error?: { issues: Array<{ message: string }> }
}

const messagesOf = (result: ParseLike) =>
  result.success
    ? []
    : (result.error?.issues.map((issue) => issue.message) ?? [])

describe('schema do formulário de categoria (AC-007)', () => {
  it('aceita nome e tipo válidos', () => {
    const result = categorySchema.safeParse({
      name: 'Pets',
      type: 'expense',
    })

    expect(result.success).toBe(true)
  })

  it('exige o nome com pelo menos 3 caracteres', () => {
    const message = 'Informe o nome da categoria (mínimo 3 caracteres)'

    expect(
      messagesOf(categorySchema.safeParse({ name: '  ', type: 'expense' })),
    ).toContain(message)
    expect(
      messagesOf(categorySchema.safeParse({ name: 'A', type: 'expense' })),
    ).toContain(message)
    expect(
      messagesOf(categorySchema.safeParse({ name: 'Pe', type: 'expense' })),
    ).toContain(message)
  })

  it('aceita nome com exatamente 3 caracteres', () => {
    expect(
      categorySchema.safeParse({ name: 'Pet', type: 'expense' }).success,
    ).toBe(true)
  })

  it('exige um tipo válido', () => {
    expect(
      messagesOf(categorySchema.safeParse({ name: 'Pets', type: '' })),
    ).toContain('Selecione o tipo')
    expect(
      messagesOf(categorySchema.safeParse({ name: 'Pets', type: 'outro' })),
    ).toContain('Selecione o tipo')
  })

  it('exporta as opções de tipo com rótulos em pt-BR', () => {
    expect(categoryTypeOptions).toEqual([
      { value: 'income', label: 'Receita' },
      { value: 'expense', label: 'Despesa' },
    ])
  })
})
