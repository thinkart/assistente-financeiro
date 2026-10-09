import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CategoryReport } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils/format'

interface CategoryReportTableProps {
  report: CategoryReport[]
}

export function CategoryReportTable({ report }: CategoryReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Detalhamento por categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden min-[720px]:block">
          <Table aria-label="Detalhamento por categoria">
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Percentual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((item) => (
                <TableRow key={item.categoryId} className="odd:bg-muted/40">
                  <TableCell className="font-medium">
                    {item.categoryName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(item.percentage)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul
          aria-label="Detalhamento por categoria (mobile)"
          className="min-[720px]:hidden"
        >
          {report.map((item) => (
            <li
              key={item.categoryId}
              className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0"
            >
              <span className="font-medium">{item.categoryName}</span>
              <span className="text-right">
                <span className="block">{formatCurrency(item.total)}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatPercentage(item.percentage)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
