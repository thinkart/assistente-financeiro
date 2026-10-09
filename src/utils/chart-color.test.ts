import { describe, expect, it } from 'vitest'
import {
  CHART_COLOR_VARS,
  SUMMARY_CHART_COLOR_VARS,
  readChartColor,
  readSummaryChartColor,
  resolveChartColor,
} from './chart-color'

describe('cores de gráfico (AC-005)', () => {
  it('resolve valores de CSS variable em cores hsl', () => {
    expect(resolveChartColor('0 84% 60%')).toBe('hsl(0 84% 60%)')
    expect(resolveChartColor('  ')).toBe('currentColor')
  })

  it('mapeia os tipos para as variáveis semânticas', () => {
    expect(CHART_COLOR_VARS).toEqual({
      income: '--income',
      expense: '--expense',
    })
  })

  it('lê a cor do tipo a partir do tema atual', () => {
    document.documentElement.style.setProperty('--income', '142 71% 45%')

    try {
      expect(readChartColor('income')).toBe('hsl(142 71% 45%)')
    } finally {
      document.documentElement.style.removeProperty('--income')
    }
  })
})

describe('cores do resumo financeiro (AC-001)', () => {
  it('mapeia as séries para as variáveis de gráfico', () => {
    expect(SUMMARY_CHART_COLOR_VARS).toEqual({
      income: '--chart-income',
      expense: '--chart-expense',
      balance: '--chart-balance',
    })
  })

  it('lê a cor de cada série a partir do tema atual', () => {
    document.documentElement.style.setProperty('--chart-income', '221 83% 53%')
    document.documentElement.style.setProperty('--chart-expense', '0 84% 60%')
    document.documentElement.style.setProperty('--chart-balance', '142 71% 45%')

    try {
      expect(readSummaryChartColor('income')).toBe('hsl(221 83% 53%)')
      expect(readSummaryChartColor('expense')).toBe('hsl(0 84% 60%)')
      expect(readSummaryChartColor('balance')).toBe('hsl(142 71% 45%)')
    } finally {
      document.documentElement.style.removeProperty('--chart-income')
      document.documentElement.style.removeProperty('--chart-expense')
      document.documentElement.style.removeProperty('--chart-balance')
    }
  })

  it('usa currentColor quando a variável não está definida', () => {
    document.documentElement.style.removeProperty('--chart-balance')

    expect(readSummaryChartColor('balance')).toBe('currentColor')
  })
})
