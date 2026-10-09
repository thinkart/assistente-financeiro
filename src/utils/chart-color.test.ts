import { describe, expect, it } from 'vitest'
import {
  CHART_COLOR_VARS,
  readChartColor,
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
