import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/app/providers/theme-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { readSummaryChartColor } from '@/utils/chart-color'
import { formatCurrency } from '@/utils/format'
import type { MonthlySummaryPoint } from './monthly-summary'

interface ResumoFinanceiroChartProps {
  data: MonthlySummaryPoint[]
}

export function ResumoFinanceiroChart({ data }: ResumoFinanceiroChartProps) {
  const { resolvedTheme } = useTheme()

  const incomeColor = readSummaryChartColor('income')
  const expenseColor = readSummaryChartColor('expense')
  const balanceColor = readSummaryChartColor('balance')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          key={resolvedTheme}
          role="img"
          aria-label="Resumo Financeiro"
          className="h-64 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border"
              />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Receita"
                stroke={incomeColor}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Despesa"
                stroke={expenseColor}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Saldo"
                stroke={balanceColor}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
