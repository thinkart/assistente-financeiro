import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { setPrefersDark } from '@/test/match-media'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './theme-context'

const renderTheme = () =>
  renderHook(() => useTheme(), { wrapper: ThemeProvider })

describe('ThemeProvider / useTheme (AC-004)', () => {
  it('expõe system como padrão quando não há tema salvo', () => {
    const { result } = renderTheme()

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('lê o tema salvo do localStorage na inicialização', () => {
    localStorage.setItem('financas-theme', 'dark')

    const { result } = renderTheme()

    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme persiste no localStorage e aplica a classe dark imediatamente', () => {
    const { result } = renderTheme()

    act(() => result.current.setTheme('dark'))

    expect(localStorage.getItem('financas-theme')).toBe('dark')
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => result.current.setTheme('light'))

    expect(localStorage.getItem('financas-theme')).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('trata valor inválido no localStorage como system', () => {
    localStorage.setItem('financas-theme', 'solar')

    const { result } = renderTheme()

    expect(result.current.theme).toBe('system')
  })

  it('lança erro quando useTheme é usado fora do provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme deve ser usado dentro de um ThemeProvider',
    )

    consoleError.mockRestore()
  })
})

describe('modo system reage ao prefers-color-scheme (AC-005)', () => {
  it('resolve dark quando o SO prefere tema escuro', () => {
    setPrefersDark(true)

    const { result } = renderTheme()

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('atualiza ao mudar a preferência do SO sem recarregar', () => {
    const { result } = renderTheme()

    act(() => setPrefersDark(true))
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => setPrefersDark(false))
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('não reage à mudança do SO quando o tema é fixo', () => {
    const { result } = renderTheme()

    act(() => result.current.setTheme('light'))
    act(() => setPrefersDark(true))

    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
