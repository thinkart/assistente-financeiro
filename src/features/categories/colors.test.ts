import { describe, expect, it } from 'vitest'
import {
  categoryBadgeClassName,
  categoryColorTokens,
  getCategoryColorToken,
} from './colors'

describe('cores de categoria (AC-005)', () => {
  it('mapeia as categorias do seed para tokens fixos', () => {
    expect(getCategoryColorToken('salario')).toBe('category-2')
    expect(getCategoryColorToken('freelance')).toBe('category-5')
    expect(getCategoryColorToken('alimentacao')).toBe('category-3')
    expect(getCategoryColorToken('transporte')).toBe('category-1')
    expect(getCategoryColorToken('moradia')).toBe('category-4')
    expect(getCategoryColorToken('lazer')).toBe('category-6')
    expect(getCategoryColorToken('saude')).toBe('category-8')
    expect(getCategoryColorToken('educacao')).toBe('category-7')
  })

  it('usa fallback determinístico para ids desconhecidos', () => {
    const first = getCategoryColorToken('categoria-nova')
    const second = getCategoryColorToken('categoria-nova')

    expect(first).toBe(second)
    expect(categoryColorTokens).toContain(first)
    expect(categoryColorTokens).toContain(getCategoryColorToken('outra-id'))
  })

  it('gera classes estáticas com tokens de categoria', () => {
    expect(categoryBadgeClassName('salario')).toBe(
      'bg-category-2/15 text-category-2',
    )
    expect(categoryBadgeClassName('id-desconhecido')).toMatch(
      /^bg-category-\d\/15 text-category-\d$/,
    )
  })
})
