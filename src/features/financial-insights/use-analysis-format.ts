import { useState } from 'react'
import {
  readAnalysisFormat,
  writeAnalysisFormat,
  type AnalysisFormat,
} from './analysis-format'

/** Estado da preferência de formato da análise, persistida por usuário. */
export const useAnalysisFormat = (userId?: string | null) => {
  const [format, setFormatState] = useState<AnalysisFormat>(() =>
    readAnalysisFormat(userId),
  )
  const [loadedUserId, setLoadedUserId] = useState(userId)

  // Se o usuário da sessão mudar, recarrega a preferência dele.
  if (loadedUserId !== userId) {
    setLoadedUserId(userId)
    setFormatState(readAnalysisFormat(userId))
  }

  const setFormat = (next: AnalysisFormat) => {
    setFormatState(next)
    writeAnalysisFormat(userId, next)
  }

  return [format, setFormat] as const
}
