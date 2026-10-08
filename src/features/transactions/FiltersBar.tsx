import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Category, TransactionFilters, TransactionType } from '@/types'
import { transactionTypeOptions } from './schemas'

interface FiltersBarProps {
  categories: Category[]
  onApply: (filters: TransactionFilters) => void
}

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function FiltersBar({ categories, onApply }: FiltersBarProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'' | TransactionType>('')
  const [categoryId, setCategoryId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onApply({
      search: search.trim() || undefined,
      type: type || undefined,
      categoryId: categoryId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  return (
    <form
      aria-label="Filtros de transações"
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_2fr_auto] lg:items-end"
    >
      <div className="space-y-2">
        <label htmlFor="filters-search" className="text-sm font-medium">
          Buscar
        </label>
        <Input
          id="filters-search"
          type="search"
          placeholder="Descrição da transação"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="filters-type" className="text-sm font-medium">
          Tipo
        </label>
        <select
          id="filters-type"
          className={selectClassName}
          value={type}
          onChange={(event) =>
            setType(event.target.value as '' | TransactionType)
          }
        >
          <option value="">Todos</option>
          {transactionTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="filters-category" className="text-sm font-medium">
          Categoria
        </label>
        <select
          id="filters-category"
          className={selectClassName}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset
        aria-label="Período"
        className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1"
      >
        <div className="space-y-2">
          <label htmlFor="filters-start" className="text-sm font-medium">
            De
          </label>
          <Input
            id="filters-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="filters-end" className="text-sm font-medium">
            Até
          </label>
          <Input
            id="filters-end"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </fieldset>

      <Button type="submit" className="sm:col-span-2 lg:col-span-1">
        Aplicar filtros
      </Button>
    </form>
  )
}
