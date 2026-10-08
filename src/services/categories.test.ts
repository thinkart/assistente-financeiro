import { beforeEach, describe, expect, it } from 'vitest'
import { resetCategoryStore } from '@/mocks/handlers/categories'
import { fetchCategories } from './categories'

describe('serviço de categorias (AC-003)', () => {
  beforeEach(() => {
    resetCategoryStore()
  })

  it('busca a lista de categorias tipada', async () => {
    const categories = await fetchCategories()

    expect(categories.length).toBeGreaterThanOrEqual(6)
    expect(categories.some((category) => category.name === 'Salário')).toBe(
      true,
    )
    expect(categories.every((category) => category.id.length > 0)).toBe(true)
  })
})
