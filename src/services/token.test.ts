import { beforeEach, describe, expect, it } from 'vitest'
import {
  TOKEN_STORAGE_KEY,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from './token'

describe('token storage (AC-005)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('guarda e lê o token na chave financas-token', () => {
    setStoredToken('abc123')

    expect(TOKEN_STORAGE_KEY).toBe('financas-token')
    expect(localStorage.getItem('financas-token')).toBe('abc123')
    expect(getStoredToken()).toBe('abc123')
  })

  it('retorna null quando não há token', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('limpa o token', () => {
    setStoredToken('abc123')
    clearStoredToken()

    expect(getStoredToken()).toBeNull()
  })
})
