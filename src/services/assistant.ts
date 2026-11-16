import { api } from './api'

export interface AIConsentResponse {
  ai_consent: boolean
  provider: string
  purpose: string
  data_shared: string[]
  data_never_shared: string[]
}

export interface AssistantAnalysisBackendResponse {
  status: string
  period?: string
  updated_at?: string
  ai_consent: boolean
  metrics?: {
    current: {
      income: number
      expense: number
      balance: number
      expense_ratio: number
      category_breakdown: Array<{
        category_name: string
        total: number
        percentage: number
      }>
    }
    previous?: {
      income: number
      expense: number
      balance: number
    }
  }
  analysis?: {
    source: 'ai_provider' | 'deterministic_fallback'
    summary: string
    positive_points: string[]
    attention_points: string[]
    recommendations: string[]
    data_limitations: string[]
  }
}

export const getAIConsent = async (): Promise<AIConsentResponse> => {
  const response = await api.get<AIConsentResponse>('/assistant/consent')
  return response.data
}

export const updateAIConsent = async (consent: boolean): Promise<boolean> => {
  const response = await api.post<{ ai_consent: boolean }>('/assistant/consent', { consent })
  return response.data.ai_consent
}

export const getAssistantAnalysis = async (
  refresh = false,
): Promise<AssistantAnalysisBackendResponse> => {
  const response = await api.get<AssistantAnalysisBackendResponse>(
    `/assistant/analysis${refresh ? '?refresh=true' : ''}`,
  )
  return response.data
}
