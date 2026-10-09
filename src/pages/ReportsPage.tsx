import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { KpiCards } from '@/components/KpiCards'
import { useSummary } from '@/features/dashboard/use-summary'
import { CategoryReportChart } from '@/features/reports/CategoryReportChart'
import { CategoryReportTable } from '@/features/reports/CategoryReportTable'
import {
  ReportsFilters,
  type ReportsFilterValues,
} from '@/features/reports/ReportsFilters'
import { useCategoryReport } from '@/features/reports/use-category-report'

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportsFilterValues>({
    type: 'expense',
  })

  const period = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  }

  const summaryQuery = useSummary(period)
  const reportQuery = useCategoryReport({
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: filters.type,
  })

  const isLoading = summaryQuery.isPending || reportQuery.isPending
  const isError = summaryQuery.isError || reportQuery.isError
  const report = reportQuery.data ?? []

  const handleRetry = () => {
    void summaryQuery.refetch()
    void reportQuery.refetch()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Relatórios</h2>
        <p className="text-sm text-muted-foreground">
          Filtre por período e tipo para analisar os valores por categoria.
        </p>
      </div>

      <ReportsFilters onApply={setFilters} />

      {isLoading && (
        <p
          role="status"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          Carregando relatórios…
        </p>
      )}

      {isError && (
        <div className="space-y-3 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar os relatórios.
          </p>
          <Button type="button" variant="outline" onClick={handleRetry}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && summaryQuery.data && (
        <div className="space-y-4">
          <KpiCards summary={summaryQuery.data} />

          {report.length === 0 ? (
            <p
              role="status"
              className="py-8 text-center text-sm text-muted-foreground"
            >
              Nenhum dado no período.
            </p>
          ) : (
            <>
              <CategoryReportChart report={report} type={filters.type} />
              <CategoryReportTable report={report} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
