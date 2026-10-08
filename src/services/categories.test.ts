import { beforeEach, describe, expect, it } from 'vitest'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { resetTransactionStore } from '@/mocks/handlers/transactions'
import type { CategoryInput } from '@/types'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from './categories'

const newCategory: CategoryInput = { name: 'Pets', type: 'expense' }

describe('serviço de categorias (AC-003)', () => {
  beforeEach(() => {
    resetCategoryStore()
    resetTransactionStore()
  })

  it('busca a lista de categorias tipada', async () => {
    const categories = await fetchCategories()

    expect(categories.length).toBeGreaterThanOrEqual(6)
    expect(categories.some((category) => category.name === 'Salário')).toBe(
      true,
    )
    expect(categories.every((category) => category.id.length > 0)).toBe(true)
  })

  it('cria uma categoria e a inclui na listagem', async () => {
    const created = await createCategory(newCategory)

    expect(created.id).toBeTruthy()
    expect(created.name).toBe('Pets')

    const categories = await fetchCategories()
    expect(categories.some((category) => category.id === created.id)).toBe(true)
  })

  it('atualiza uma categoria existente', async () => {
    const updated = await updateCategory('lazer', {
      name: 'Lazer e hobbies',
      type: 'expense',
    })

    expect(updated.id).toBe('lazer')
    expect(updated.name).toBe('Lazer e hobbies')

    const categories = await fetchCategories()
    expect(categories.find((category) => category.id === 'lazer')?.name).toBe(
      'Lazer e hobbies',
    )
  })

  it('remove uma categoria sem vínculos', async () => {
    const created = await createCategory(newCategory)

    await deleteCategory(created.id)

    const categories = await fetchCategories()
    expect(categories.some((category) => category.id === created.id)).toBe(
      false,
    )
  })

  it('rejeita a remoção de categoria em uso (400)', async () => {
    await expect(deleteCategory('educacao')).rejects.toMatchObject({
      response: { status: 400 },
    })
  })
})
