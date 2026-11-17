import type { MonthlyComparison, MonthlyIndicators } from './types'
import type { Pattern } from './patterns'
import type { Insight, DataStatus } from './types'

export const generateInsights = (
  status: DataStatus,
  current: MonthlyIndicators,
  comparison: MonthlyComparison | null,
  patterns: Pattern[],
): Insight[] => {
  if (status !== 'ready' && status !== 'single-month') return []

  const insights: Insight[] = []

  for (const p of patterns) {
    insights.push({
      kind: p.kind === 'positive' ? 'positive' : 'attention',
      message: p.detail,
    })
  }

  insights.push(...generateRecommendations(current, comparison, patterns))

  return insights
}

const generateRecommendations = (
  current: MonthlyIndicators,
  comparison: MonthlyComparison | null,
  patterns: Pattern[],
): Insight[] => {
  const recommendations: Insight[] = []

  const hasNegativeBalance = patterns.some((p) => p.id === 'negative-balance')
  const hasExpensesExceedIncome = patterns.some((p) => p.id === 'expenses-exceed-income')
  const hasExpenseGrowth = patterns.some((p) => p.id === 'expense-growth')
  const hasConcentration = patterns.some((p) => p.id === 'category-concentration')

  if (hasNegativeBalance || hasExpensesExceedIncome) {
    recommendations.push({
      kind: 'recommendation',
      message: 'Revise as despesas do período para ajudar a equilibrar o orçamento.',
    })
  } else if (hasConcentration && current.topExpenseCategory) {
    recommendations.push({
      kind: 'recommendation',
      message: `${current.topExpenseCategory.categoryName} concentra ${Math.round(current.topExpenseCategory.percentage)}% das despesas; acompanhe essa categoria no próximo período.`,
    })
  } else if (hasExpenseGrowth && comparison) {
    recommendations.push({
      kind: 'recommendation',
      message: `Suas despesas aumentaram ${Math.round(comparison.expenseChangePercent)}% em relação ao mês anterior.`,
    })
  } else if (current.expenseRatio > 0 && current.expenseRatio <= 100 && !hasNegativeBalance && !hasExpensesExceedIncome) {
    recommendations.push({
      kind: 'recommendation',
      message: `Continue registrando receitas e despesas para acompanhar a evolução do orçamento.`,
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      kind: 'recommendation',
      message: 'Continue registrando receitas e despesas para acompanhar a evolução do orçamento.',
    })
  }

  return recommendations
}

export const getStatusMessage = (status: DataStatus): string | null => {
  switch (status) {
    case 'no-transactions':
      return 'Sua conta ainda não tem movimentações. Cadastre receitas ou despesas para iniciar a análise.'
    case 'income-only':
      return 'Apenas receitas foram registradas até o momento. Cadastre despesas para obter uma análise completa.'
    case 'expense-only':
      return 'Apenas despesas foram registradas até o momento. Cadastre receitas para obter uma análise completa.'
    case 'single-month':
      return 'Ainda não há dados dos dois períodos para uma comparação histórica. As informações cadastradas continuam disponíveis nos indicadores.'
    case 'ready':
      return null
  }
}
