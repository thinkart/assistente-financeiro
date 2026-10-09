import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transactionTypeOptions } from '@/features/transactions/schemas'
import type { TransactionType } from '@/types'

export interface ReportsFilterValues {
  startDate?: string
  endDate?: string
  type: TransactionType
}

interface ReportsFiltersProps {
  onApply: (filters: ReportsFilterValues) => void
}

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function ReportsFilters({ onApply }: ReportsFiltersProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState<TransactionType>('expense')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onApply({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      type,
    })
  }

  return (
    <form
      aria-label="Filtros de relatórios"
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto] lg:items-end"
    >
      <fieldset
        aria-label="Período"
        className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1"
      >
        <div className="space-y-2">
          <label htmlFor="reports-start" className="text-sm font-medium">
            De
          </label>
          <Input
            id="reports-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reports-end" className="text-sm font-medium">
            Até
          </label>
          <Input
            id="reports-end"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="reports-type" className="text-sm font-medium">
          Tipo
        </label>
        <select
          id="reports-type"
          className={selectClassName}
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
        >
          {transactionTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="sm:col-span-2 lg:col-span-1">
        Aplicar filtros
      </Button>
    </form>
  )
}
