import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bem-vindo ao seu assistente financeiro</CardTitle>
        <CardDescription>
          O painel com saldo, entradas e saídas chega na próxima etapa.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Use o menu para navegar entre transações, categorias e relatórios.
      </CardContent>
    </Card>
  )
}
