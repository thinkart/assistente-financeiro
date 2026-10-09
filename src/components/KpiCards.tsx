import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SummaryReport } from '@/types'
import { formatCurrency } from '@/utils/format'

interface KpiCardsProps {
  summary: SummaryReport
}

export function KpiCards({ summary }: KpiCardsProps) {
  const balanceClass = summary.balance >= 0 ? 'text-income' : 'text-expense'

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-income">
            {formatCurrency(summary.income)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-expense">
            {formatCurrency(summary.expense)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-semibold ${balanceClass}`}>
            {formatCurrency(summary.balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
