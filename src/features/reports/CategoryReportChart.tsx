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
import type { CategoryReport, TransactionType } from '@/types'
import { readChartColor } from '@/utils/chart-color'
import { formatCurrency } from '@/utils/format'

interface CategoryReportChartProps {
  report: CategoryReport[]
  type: TransactionType
  title?: string
}

export function CategoryReportChart({
  report,
  type,
  title,
}: CategoryReportChartProps) {
  const { resolvedTheme } = useTheme()

  const barColor = readChartColor(type)
  const chartTitle =
    title ??
    (type === 'income' ? 'Receitas por categoria' : 'Despesas por categoria')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          key={resolvedTheme}
          role="img"
          aria-label={chartTitle}
          className="h-72 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                className="stroke-border"
              />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="categoryName"
                width={120}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                cursor={{ fill: 'currentColor', opacity: 0.1 }}
              />
              <Bar dataKey="total" fill={barColor} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
