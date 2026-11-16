export type AnalysisFormat = 'simple' | 'detailed'

export const ANALYSIS_FORMAT_STORAGE_PREFIX = 'financas-analysis-format'

export const analysisFormatStorageKey = (userId?: string | null): string =>
  `${ANALYSIS_FORMAT_STORAGE_PREFIX}:${userId ?? 'anonimo'}`

/**
 * Lê a preferência de formato da análise para o usuário.
 * Padrão: 'detailed' (comportamento atual, em blocos).
 */
export const readAnalysisFormat = (userId?: string | null): AnalysisFormat => {
  try {
    if (localStorage.getItem(analysisFormatStorageKey(userId)) === 'simple') {
      return 'simple'
    }
  } catch {
    // localStorage indisponível: mantém o formato padrão
  }
  return 'detailed'
}

/** Persiste a preferência de formato da análise do usuário. */
export const writeAnalysisFormat = (
  userId: string | null | undefined,
  format: AnalysisFormat,
): void => {
  try {
    localStorage.setItem(analysisFormatStorageKey(userId), format)
  } catch {
    // localStorage indisponível: preferência vale só nesta sessão
  }
}
