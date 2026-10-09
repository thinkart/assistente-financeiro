import { endOfMonth, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { KpiCards } from '@/features/dashboard/KpiCards'
import { LatestTransactions } from '@/features/dashboard/LatestTransactions'
import { MonthlyExpensesChart } from '@/features/dashboard/MonthlyExpensesChart'
import { buildMonthlyExpenses } from '@/features/dashboard/monthly-expenses'
import { useSummary } from '@/features/dashboard/use-summary'
import { useTransactions } from '@/features/transactions/use-transactions'

export function DashboardPage() {
  const today = new Date()
  const period = {
    startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
  }
  const monthLabel = format(today, 'MMMM yyyy', { locale: ptBR })

  const summaryQuery = useSummary(period)
  const transactionsQuery = useTransactions()

  const isLoading = summaryQuery.isPending || transactionsQuery.isPending
  const isError = summaryQuery.isError || transactionsQuery.isError

  const handleRetry = () => {
    void summaryQuery.refetch()
    void transactionsQuery.refetch()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Resumo financeiro do mês
        </h2>
        <p className="text-sm capitalize text-muted-foreground">{monthLabel}</p>
      </div>

      {isLoading && (
        <p
          role="status"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          Carregando dashboard…
        </p>
      )}

      {isError && (
        <div className="space-y-3 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar o dashboard.
          </p>
          <Button type="button" variant="outline" onClick={handleRetry}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && summaryQuery.data && (
        <>
          <KpiCards summary={summaryQuery.data} />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MonthlyExpensesChart
                data={buildMonthlyExpenses(transactionsQuery.data ?? [])}
              />
            </div>
            <LatestTransactions transactions={transactionsQuery.data ?? []} />
          </div>
        </>
      )}
    </div>
  )
}
