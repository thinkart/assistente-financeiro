import { http, HttpResponse } from 'msw'
import { applyMockDelay } from '../delay'
import { getAuthenticatedUserId } from './auth'
import { errorResponse } from './responses'

let mockConsent = false

export const assistantHandlers = [
  http.get('*/assistant/consent', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    return HttpResponse.json({
      ai_consent: mockConsent,
      provider: 'Google Gemini',
      purpose: 'Interpretação e resumo inteligente de métricas financeiras agregadas.',
      data_shared: [
        'Total mensal de receitas e despesas',
        'Saldo calculado',
        'Percentual comprometido da renda',
        'Percentual das categorias principais de despesas',
        'Padrões agregados identificados',
      ],
      data_never_shared: [
        'Nome, CPF, Telefone e E-mail',
        'Senhas e chaves de acesso',
        'Descrições e comprovantes de transações individuais',
      ],
    })
  }),

  http.post('*/assistant/consent', async ({ request }) => {
    await applyMockDelay()
    const userId = getAuthenticatedUserId(request)
    if (!userId) return errorResponse(401, 'Token inválido ou ausente')

    const body = (await request.json()) as { consent?: boolean }
    mockConsent = Boolean(body.consent)

    return HttpResponse.json({
      message: 'Consentimento atualizado com sucesso.',
      ai_consent: mockConsent,
    })
  }),
]
