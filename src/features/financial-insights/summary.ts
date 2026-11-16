import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/utils/format'
import type { FinancialAnalysis } from './types'
import { CATEGORY_CONCENTRATION_THRESHOLD } from './patterns'

/**
 * Monta uma única mensagem de resumo em linguagem simples e informal
 * a partir da análise financeira. Usada quando a pessoa escolhe o modo
 * "Resumido" na entrega da análise da página inicial.
 */
export const buildSimpleSummary = (
  analysis: FinancialAnalysis,
  referenceDate: Date = new Date(),
): string => {
  const { statusMessage, current, comparison } = analysis

  if (statusMessage) return statusMessage

  const { income, expense, balance } = current.summary
  const previousMonthLabel = format(subMonths(referenceDate, 1), 'MMMM', {
    locale: ptBR,
  })

  const parts: string[] = []

  if (balance > 0) {
    parts.push(
      `Resumo do mês: você entrou com ${formatCurrency(income)}, gastou ${formatCurrency(expense)} e sobrou ${formatCurrency(balance)}.`,
    )
  } else if (balance < 0) {
    parts.push(
      `Resumo do mês: você entrou com ${formatCurrency(income)}, gastou ${formatCurrency(expense)} e fechou ${formatCurrency(Math.abs(balance))} no vermelho.`,
    )
  } else {
    parts.push(
      `Resumo do mês: você entrou com ${formatCurrency(income)}, gastou ${formatCurrency(expense)} e fechou o mês no zero a zero.`,
    )
  }

  if (comparison) {
    if (comparison.incomeChange > 0) {
      parts.push(
        `Comparado a ${previousMonthLabel}, você ganhou ${formatCurrency(comparison.incomeChange)} a mais.`,
      )
    } else if (comparison.incomeChange < 0) {
      parts.push(
        `Comparado a ${previousMonthLabel}, entrou ${formatCurrency(Math.abs(comparison.incomeChange))} a menos.`,
      )
    } else if (comparison.expenseChange < 0) {
      parts.push(
        `E o melhor: você gastou ${formatCurrency(Math.abs(comparison.expenseChange))} a menos do que em ${previousMonthLabel}.`,
      )
    } else if (comparison.expenseChange > 0) {
      parts.push(
        `Só que os gastos subiram ${formatCurrency(comparison.expenseChange)} em relação a ${previousMonthLabel}.`,
      )
    }
  }

  const top = current.topExpenseCategory
  if (top && top.percentage >= CATEGORY_CONCENTRATION_THRESHOLD) {
    parts.push(
      `Atenção com ${top.categoryName}: ela foi o maior peso, com ${Math.round(top.percentage)}% de tudo que você gastou.`,
    )
  }

  parts.push(
    balance >= 0
      ? 'Dica: continua registrando tudo certinho e acompanhando os gastos pra manter o ritmo!'
      : 'Dica: dá uma olhada nas despesas do próximo mês pra equilibrar as contas.',
  )

  return parts.join(' ')
}
