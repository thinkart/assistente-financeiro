import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Info, Lightbulb, RefreshCw, ShieldCheck, Sparkles, ThumbsUp, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KpiCards } from '@/components/KpiCards'
import { useAuth } from '@/features/auth/auth-context'
import { useCategories } from '@/features/categories/use-categories'
import {
  analyzeFinances,
  buildSimpleSummary,
  useAnalysisFormat,
} from '@/features/financial-insights'
import type { AnalysisFormat, Insight } from '@/features/financial-insights'
import { useTransactions } from '@/features/transactions/use-transactions'
import { getApiErrorMessage } from '@/services/api'
import { getAIConsent, updateAIConsent, type AIConsentResponse } from '@/services/assistant'
import type { SummaryReport } from '@/types'

export function AssistantPage() {
  const { user } = useAuth()
  const transactionsQuery = useTransactions()
  const categoriesQuery = useCategories()

  const [aiConsentData, setAiConsentData] = useState<AIConsentResponse | null>(null)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [isUpdatingConsent, setIsUpdatingConsent] = useState(false)
  const [analysisFormat, setAnalysisFormat] = useAnalysisFormat(user?.id)

  useEffect(() => {
    getAIConsent()
      .then((data) => setAiConsentData(data))
      .catch(() => {
        // Fallback silencioso caso endpoint não esteja disponível
      })
  }, [])

  const handleToggleConsent = async (consent: boolean) => {
    setIsUpdatingConsent(true)
    try {
      const updated = await updateAIConsent(consent)
      setAiConsentData((prev) => (prev ? { ...prev, ai_consent: updated } : null))
      setShowConsentModal(false)
    } finally {
      setIsUpdatingConsent(false)
    }
  }

  const allTransactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  )
  const allCategories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )
  const now = useMemo(() => new Date(), [])

  const analysis = useMemo(
    () => analyzeFinances(allTransactions, allCategories, now),
    [allTransactions, allCategories, now],
  )

  const simpleSummary = useMemo(
    () => buildSimpleSummary(analysis, now),
    [analysis, now],
  )

  const isPending = transactionsQuery.isPending || categoriesQuery.isPending
  const isFetching = transactionsQuery.isFetching || categoriesQuery.isFetching
  const isError = transactionsQuery.isError || categoriesQuery.isError
  const analysisTimestamp = Math.max(
    transactionsQuery.dataUpdatedAt,
    categoriesQuery.dataUpdatedAt,
  )
  const lastAnalysisAt =
    !isError && analysisTimestamp > 0 ? new Date(analysisTimestamp) : null
  const periodLabel = format(now, 'MMMM yyyy', { locale: ptBR })
  const firstName = user?.name.trim().split(/\s+/)[0] || 'Olá'

  const handleRefresh = () =>
    Promise.all([transactionsQuery.refetch(), categoriesQuery.refetch()])

  const hasTransactions = allTransactions.length > 0
  const hasInsights = analysis.insights.length > 0

  const positiveInsights = analysis.insights.filter((i) => i.kind === 'positive')
  const attentionInsights = analysis.insights.filter((i) => i.kind === 'attention')
  const recommendations = analysis.insights.filter((i) => i.kind === 'recommendation')

  const zeroSummary: SummaryReport = { income: 0, expense: 0, balance: 0 }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Olá, {firstName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Período analisado: {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowConsentModal(true)}
            className="text-xs text-muted-foreground"
          >
            <ShieldCheck size={16} className="mr-1 text-primary" />
            Privacidade & IA ({aiConsentData?.ai_consent ? 'Ativada' : 'Desativada'})
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleRefresh()}
            disabled={isFetching}
          >
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
            Atualizar análise
          </Button>
        </div>
      </header>

      {/* Modal de Transparência e Consentimento com a IA */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} />
              Privacidade e Análise Externa por IA
            </DialogTitle>
            <DialogDescription>
              Entenda como seus dados são protegidos antes de ativar a interpretação por IA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm text-muted-foreground">
            <div className="rounded-md border border-border p-3">
              <h4 className="font-semibold text-foreground mb-1">Qual serviço receberá os dados?</h4>
              <p>Google Gemini (através de conexão criptografada direta pelo backend do servidor).</p>
            </div>

            <div className="rounded-md border border-border p-3">
              <h4 className="font-semibold text-foreground mb-1">Quais indicadores são enviados?</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Totais mensais agregados de receitas, despesas e saldo.</li>
                <li>Percentual de comprometimento da renda e participação por categoria.</li>
                <li>Padrões de variação matemática calculados localmente.</li>
              </ul>
            </div>

            <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
              <h4 className="font-semibold text-foreground mb-1">O que NUNCA é compartilhado?</h4>
              <p className="text-xs">
                Seu nome, CPF, e-mail, telefone, senhas, tokens ou descrições individualizadas de compras nunca são enviados para a IA externa.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {aiConsentData?.ai_consent ? (
              <Button
                variant="destructive"
                onClick={() => void handleToggleConsent(false)}
                disabled={isUpdatingConsent}
              >
                Desativar Integração com IA
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => void handleToggleConsent(true)}
                disabled={isUpdatingConsent}
              >
                Concordar e Ativar IA
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowConsentModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPending && (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">
          Carregando sua análise financeira…
        </p>
      )}

      {isError && (
        <div className="space-y-3 py-8 text-center">
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(
              transactionsQuery.error ?? categoriesQuery.error,
              'Não foi possível carregar sua análise financeira.',
            )}
          </p>
          <Button type="button" variant="outline" onClick={() => void handleRefresh()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isPending && !isError && (
        <>
          <KpiCards summary={hasTransactions ? analysis.current.summary : zeroSummary} />

          <Tabs
            value={analysisFormat}
            onValueChange={(value) => setAnalysisFormat(value as AnalysisFormat)}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    <CardTitle className="text-lg">Análise financeira inteligente</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {aiConsentData?.ai_consent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <CheckCircle2 size={12} />
                        IA Conectada
                      </span>
                    )}
                    <TabsList aria-label="Formato da análise" className="h-8 p-0.5">
                      <TabsTrigger value="simple" className="px-2 py-1 text-xs">
                        Resumido
                      </TabsTrigger>
                      <TabsTrigger value="detailed" className="px-2 py-1 text-xs">
                        Detalhado
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comparação com{' '}
                  {format(subMonths(now, 1), 'MMMM', { locale: ptBR })} baseada
                  nas suas movimentações.
                </p>
              </CardHeader>
              <CardContent>
                <TabsContent value="simple" className="mt-0">
                  <p
                    role="status"
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {simpleSummary}
                  </p>
                </TabsContent>
                <TabsContent value="detailed" className="mt-0">
                  {analysis.statusMessage ? (
                    <p role="status" className="text-sm text-muted-foreground">
                      {analysis.statusMessage}
                    </p>
                  ) : hasInsights ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <InsightSection
                        icon={<ThumbsUp size={18} className="text-income" />}
                        title="Pontos positivos"
                        items={positiveInsights}
                      />
                      <InsightSection
                        icon={<TriangleAlert size={18} className="text-expense" />}
                        title="Pontos de atenção"
                        items={attentionInsights}
                      />
                      <InsightSection
                        icon={<Lightbulb size={18} className="text-primary" />}
                        title="Recomendações"
                        items={recommendations}
                      />
                    </div>
                  ) : (
                    <p role="status" className="text-sm text-muted-foreground">
                      {analysis.statusMessage ??
                        'Continue registrando receitas e despesas para acompanhar a evolução do orçamento.'}
                    </p>
                  )}
                </TabsContent>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <p>
                    Última análise:{' '}
                    {lastAnalysisAt
                      ? format(lastAnalysisAt, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })
                      : 'aguardando dados'}
                  </p>
                  <p className="flex items-center gap-1">
                    <Info size={13} />
                    Cálculos determinísticos locais protegidos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </>
      )}
    </div>
  )
}

function InsightSection({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: Insight[]
}) {
  return (
    <section aria-label={title} className="space-y-2 rounded-md border border-border p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.length > 0 ? (
          items.map((item) => <li key={item.message}>{item.message}</li>)
        ) : (
          <li>Nenhuma observação para este período.</li>
        )}
      </ul>
    </section>
  )
}
