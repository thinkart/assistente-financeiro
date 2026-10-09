import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/app/providers/theme-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'
import { CHART_COLOR_VAR, resolveChartColor } from './chart-color'
import type { MonthlyExpensePoint } from './monthly-expenses'

interface MonthlyExpensesChartProps {
  data: MonthlyExpensePoint[]
}

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  const { resolvedTheme } = useTheme()

  const barColor = resolveChartColor(
    getComputedStyle(document.documentElement).getPropertyValue(
      CHART_COLOR_VAR,
    ),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Despesas por mês (R$)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          key={resolvedTheme}
          role="img"
          aria-label="Despesas por mês"
          className="h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="total" fill={barColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
