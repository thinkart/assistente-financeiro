export const CHART_COLOR_VAR = '--expense'

export const resolveChartColor = (rawValue: string) =>
  rawValue.trim() ? `hsl(${rawValue.trim()})` : 'currentColor'
