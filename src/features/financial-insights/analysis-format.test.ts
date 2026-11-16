import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  analysisFormatStorageKey,
  readAnalysisFormat,
  writeAnalysisFormat,
} from './analysis-format'

describe('preferência de formato da análise', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('usa o formato detalhado por padrão', () => {
    expect(readAnalysisFormat('user-a')).toBe('detailed')
  })

  it('persiste e relê a escolha da pessoa', () => {
    writeAnalysisFormat('user-a', 'simple')
    expect(readAnalysisFormat('user-a')).toBe('simple')

    writeAnalysisFormat('user-a', 'detailed')
    expect(readAnalysisFormat('user-a')).toBe('detailed')
  })

  it('mantém a preferência isolada por usuário', () => {
    writeAnalysisFormat('user-a', 'simple')

    expect(readAnalysisFormat('user-b')).toBe('detailed')
    expect(readAnalysisFormat('user-a')).toBe('simple')
  })

  it('volta ao padrão quando o valor armazenado é inválido', () => {
    localStorage.setItem(analysisFormatStorageKey('user-a'), 'qualquer-coisa')

    expect(readAnalysisFormat('user-a')).toBe('detailed')
  })

  it('não quebra quando o localStorage está indisponível', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(readAnalysisFormat('user-a')).toBe('detailed')

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(() => writeAnalysisFormat('user-a', 'simple')).not.toThrow()
  })
})
