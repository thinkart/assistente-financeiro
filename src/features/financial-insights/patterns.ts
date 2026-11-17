import type { Transaction } from '@/types'
import { formatCurrency } from '@/utils/format'
import type { AnalysisTone, MonthlyComparison, MonthlyIndicators } from './types'

export interface Pattern {
  kind: 'positive' | 'attention'
  id: string
  detail: string
}

const EXPENSE_GROWTH_THRESHOLD = 15
const INCOME_DROP_THRESHOLD = -10
export const CATEGORY_CONCENTRATION_THRESHOLD = 40

const choose = (options: string[], seed: number) =>
  options[Math.abs(seed) % options.length]

export const detectPatterns = (
  current: MonthlyIndicators,
  previous: MonthlyIndicators | null,
  comparison: MonthlyComparison | null,
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
  tone: AnalysisTone = 'standard',
  seed: number = Math.floor(Math.random() * 1000),
): Pattern[] => {
  const patterns: Pattern[] = []

  if (current.summary.balance > 0) {
    let msg: string
    if (tone === 'simple') {
      msg = choose([
        `Sobrou dinheiro: você fechou no azul com ${formatCurrency(current.summary.balance)}!`,
        `Saldo no positivo em ${formatCurrency(current.summary.balance)}. Bom trabalho!`,
        `Você guardou ${formatCurrency(current.summary.balance)} neste mês.`,
      ], seed)
    } else if (tone === 'detailed') {
      msg = choose([
        `Superávit financeiro consolidado: o saldo líquido final do período encerrou positivo em ${formatCurrency(current.summary.balance)}, evidenciando margem de segurança.`,
        `Demonstrativo positivo: as movimentações resultaram em um saldo favorável de ${formatCurrency(current.summary.balance)}, mantendo as finanças estruturadas.`,
      ], seed)
    } else {
      msg = choose([
        `Seu saldo do período está positivo em ${formatCurrency(current.summary.balance)}.`,
        `Você encerrou o período com saldo favorável de ${formatCurrency(current.summary.balance)}.`,
      ], seed)
    }

    patterns.push({
      kind: 'positive',
      id: 'positive-balance',
      detail: msg,
    })
  }

  if (current.summary.balance < 0) {
    let msg: string
    if (tone === 'simple') {
      msg = choose([
        `Atenção: você gastou ${formatCurrency(Math.abs(current.summary.balance))} a mais do que ganhou.`,
        `Você fechou no vermelho em ${formatCurrency(Math.abs(current.summary.balance))}.`,
      ], seed + 1)
    } else if (tone === 'detailed') {
      msg = choose([
        `Déficit orçamentário registrado: as despesas incorridas superaram os ingressos de receita, totalizando saldo negativo de ${formatCurrency(Math.abs(current.summary.balance))}.`,
        `Resultado negativo apurado: constata-se déficit líquido de ${formatCurrency(Math.abs(current.summary.balance))}, demandando contenção nos próximos fluxos.`,
      ], seed + 1)
    } else {
      msg = choose([
        `Seu saldo do período está negativo em ${formatCurrency(Math.abs(current.summary.balance))}.`,
        `O balanço do período fechou negativo em ${formatCurrency(Math.abs(current.summary.balance))}.`,
      ], seed + 1)
    }

    patterns.push({
      kind: 'attention',
      id: 'negative-balance',
      detail: msg,
    })
  }

  if (comparison && previous) {
    if (comparison.incomeChange > 0) {
      let msg: string
      if (tone === 'simple') {
        msg = choose([
          `Você ganhou ${formatCurrency(comparison.incomeChange)} a mais que no mês passado.`,
          `Entrou ${formatCurrency(comparison.incomeChange)} a mais na sua conta este mês.`,
        ], seed + 2)
      } else if (tone === 'detailed') {
        msg = choose([
          `Expansão da receita corrente: registrou-se incremento nominal de ${formatCurrency(comparison.incomeChange)} (+${Math.round(comparison.incomeChangePercent)}%) frente ao mês antecedente.`,
          `Evolução positiva no faturamento pessoal: ingressos cresceram ${formatCurrency(comparison.incomeChange)} na comparação intermensal.`,
        ], seed + 2)
      } else {
        msg = choose([
          `As receitas cresceram ${formatCurrency(comparison.incomeChange)} em relação ao mês anterior.`,
          `Houve acréscimo de ${formatCurrency(comparison.incomeChange)} nas receitas comparado ao mês anterior.`,
        ], seed + 2)
      }

      patterns.push({
        kind: 'positive',
        id: 'income-growth',
        detail: msg,
      })
    }

    if (
      comparison.incomeChangePercent <= INCOME_DROP_THRESHOLD &&
      previous.summary.income > 0
    ) {
      let msg = `As receitas diminuíram ${formatCurrency(Math.abs(comparison.incomeChange))} em relação ao mês anterior.`
      if (tone === 'simple') {
        msg = choose([
          `Entrou ${formatCurrency(Math.abs(comparison.incomeChange))} a menos que no mês passado.`,
          `Queda de ganhos: ${formatCurrency(Math.abs(comparison.incomeChange))} a menos este mês.`,
        ], seed + 3)
      } else if (tone === 'detailed') {
        msg = choose([
          `Contração de receitas: houve retração de ${formatCurrency(Math.abs(comparison.incomeChange))} (${Math.round(Math.abs(comparison.incomeChangePercent))}%) na comparação com o ciclo anterior.`,
          `Redução no volume de entradas: constatou-se recuo de ${formatCurrency(Math.abs(comparison.incomeChange))} frente ao período anterior.`,
        ], seed + 3)
      }

      patterns.push({
        kind: 'attention',
        id: 'income-drop',
        detail: msg,
      })
    }

    if (
      comparison.expenseChangePercent >= EXPENSE_GROWTH_THRESHOLD &&
      previous.summary.expense > 0
    ) {
      let msg = `As despesas aumentaram ${formatCurrency(comparison.expenseChange)} em relação ao mês anterior.`
      if (tone === 'simple') {
        msg = choose([
          `Você gastou ${formatCurrency(comparison.expenseChange)} a mais que no mês anterior.`,
          `Os gastos subiram ${formatCurrency(comparison.expenseChange)} comparado ao mês passado.`,
        ], seed + 4)
      } else if (tone === 'detailed') {
        msg = choose([
          `Elevação expressiva no dispêndio: apurou-se alta de ${formatCurrency(comparison.expenseChange)} (+${Math.round(comparison.expenseChangePercent)}%) nos gastos consolidados.`,
          `Aceleração das despesas: constata-se aumento de ${formatCurrency(comparison.expenseChange)} em relação ao histórico imediatamente anterior.`,
        ], seed + 4)
      }

      patterns.push({
        kind: 'attention',
        id: 'expense-growth',
        detail: msg,
      })
    }

    if (
      previous.summary.expense > 0 &&
      current.summary.expense < previous.summary.expense
    ) {
      let msg = `As despesas diminuíram ${formatCurrency(Math.abs(comparison.expenseChange))} em relação ao mês anterior.`
      if (tone === 'simple') {
        msg = choose([
          `Você economizou ${formatCurrency(Math.abs(comparison.expenseChange))} em despesas este mês!`,
          `Gastos reduzidos em ${formatCurrency(Math.abs(comparison.expenseChange))} comparado ao mês passado.`,
        ], seed + 5)
      } else if (tone === 'detailed') {
        msg = choose([
          `Otimização de custos: reduziu-se em ${formatCurrency(Math.abs(comparison.expenseChange))} o total despendido em relação ao mês anterior.`,
          `Contração favorável de despesas: os desembolsos recuaram ${formatCurrency(Math.abs(comparison.expenseChange))} no período.`,
        ], seed + 5)
      }

      patterns.push({
        kind: 'positive',
        id: 'expense-reduction',
        detail: msg,
      })
    }
  }

  if (current.summary.expense > current.summary.income && current.summary.income > 0) {
    patterns.push({
      kind: 'attention',
      id: 'expenses-exceed-income',
      detail: `As despesas superaram as receitas em ${formatCurrency(current.summary.expense - current.summary.income)} neste mês.`,
    })
  }

  if (
    current.topExpenseCategory &&
    current.topExpenseCategory.percentage >= CATEGORY_CONCENTRATION_THRESHOLD
  ) {
    patterns.push({
      kind: 'attention',
      id: 'category-concentration',
      detail: `${current.topExpenseCategory.categoryName} concentra ${Math.round(current.topExpenseCategory.percentage)}% das despesas.`,
    })
  }

  const repeatedExpenses = detectRepeatedExpenses(
    currentTransactions,
    previousTransactions,
  )
  for (const repeated of repeatedExpenses) {
    patterns.push({
      kind: 'attention',
      id: `repeated-expense-${repeated.description}`,
      detail: `A despesa "${repeated.description}" aparece nos dois últimos meses com valores próximos (${formatCurrency(repeated.previousAmount)} → ${formatCurrency(repeated.currentAmount)}).`,
    })
  }

  return patterns
}

interface RepeatedExpense {
  description: string
  currentAmount: number
  previousAmount: number
}

const REPEATED_TOLERANCE = 0.1

export const detectRepeatedExpenses = (
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
): RepeatedExpense[] => {
  const previousExpenses = new Map<string, number>()
  for (const t of previousTransactions) {
    if (t.type === 'expense') {
      const key = t.description.toLowerCase().trim()
      previousExpenses.set(key, (previousExpenses.get(key) ?? 0) + t.amount)
    }
  }

  const currentExpenses = new Map<string, { amount: number; original: string }>()
  for (const t of currentTransactions) {
    if (t.type === 'expense') {
      const key = t.description.toLowerCase().trim()
      const existing = currentExpenses.get(key)
      currentExpenses.set(key, {
        amount: (existing?.amount ?? 0) + t.amount,
        original: existing?.original ?? t.description,
      })
    }
  }

  const results: RepeatedExpense[] = []

  for (const [key, { amount: currentAmount, original }] of currentExpenses) {
    const previousAmount = previousExpenses.get(key)
    if (previousAmount === undefined) continue

    const avg = (currentAmount + previousAmount) / 2
    if (avg === 0) continue

    const diff = Math.abs(currentAmount - previousAmount) / avg
    if (diff <= REPEATED_TOLERANCE) {
      results.push({
        description: original,
        currentAmount,
        previousAmount,
      })
    }
  }

  return results.sort((a, b) => b.currentAmount - a.currentAmount)
}
