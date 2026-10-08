export const categoryColorTokens = [
  'category-1',
  'category-2',
  'category-3',
  'category-4',
  'category-5',
  'category-6',
  'category-7',
  'category-8',
] as const

export type CategoryColorToken = (typeof categoryColorTokens)[number]

const colorByCategoryId: Record<string, CategoryColorToken> = {
  salario: 'category-2',
  freelance: 'category-5',
  alimentacao: 'category-3',
  transporte: 'category-1',
  moradia: 'category-4',
  lazer: 'category-6',
  saude: 'category-8',
  educacao: 'category-7',
}

export const getCategoryColorToken = (
  categoryId: string,
): CategoryColorToken => {
  const mapped = colorByCategoryId[categoryId]
  if (mapped) return mapped

  let hash = 0
  for (const char of categoryId) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100_000
  }

  return categoryColorTokens[hash % categoryColorTokens.length]
}

const badgeClassesByToken: Record<CategoryColorToken, string> = {
  'category-1': 'bg-category-1/15 text-category-1',
  'category-2': 'bg-category-2/15 text-category-2',
  'category-3': 'bg-category-3/15 text-category-3',
  'category-4': 'bg-category-4/15 text-category-4',
  'category-5': 'bg-category-5/15 text-category-5',
  'category-6': 'bg-category-6/15 text-category-6',
  'category-7': 'bg-category-7/15 text-category-7',
  'category-8': 'bg-category-8/15 text-category-8',
}

export const categoryBadgeClassName = (categoryId: string) =>
  badgeClassesByToken[getCategoryColorToken(categoryId)]
