import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CategoryBadge } from './CategoryBadge'

describe('CategoryBadge (AC-005)', () => {
  it('renderiza o nome com a cor da categoria', () => {
    render(<CategoryBadge categoryId="alimentacao" name="Alimentação" />)

    const badge = screen.getByText('Alimentação')
    expect(badge.className).toContain('text-category-3')
    expect(badge.className).toContain('bg-category-3/15')
  })

  it('usa um token válido para ids desconhecidos', () => {
    render(<CategoryBadge categoryId="categoria-nova" name="Nova" />)

    expect(screen.getByText('Nova').className).toMatch(/text-category-\d/)
  })

  it('mescla className customizada', () => {
    render(<CategoryBadge categoryId="lazer" name="Lazer" className="ml-2" />)

    const badge = screen.getByText('Lazer')
    expect(badge.className).toContain('ml-2')
    expect(badge.className).toContain('text-category-6')
  })
})
