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
import { readChartColor } from '@/utils/chart-color'
import { formatCurrency } from '@/utils/format'
import type { MonthlyExpensePoint } from './monthly-expenses'

interface MonthlyExpensesChartProps {
  data: MonthlyExpensePoint[]
}

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  const { resolvedTheme } = useTheme()

  const barColor = readChartColor('expense')

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
