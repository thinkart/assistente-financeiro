import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './schemas'

interface ParseLike {
  success: boolean
  error?: { issues: Array<{ message: string }> }
}

const messagesOf = (result: ParseLike) =>
  result.success
    ? []
    : (result.error?.issues.map((issue) => issue.message) ?? [])

const validRegister = {
  name: 'Ana Souza',
  cpf: '123.456.789-00',
  email: 'ana@financas.dev',
  phone: '(11) 98888-7777',
  password: '123456',
  confirmPassword: '123456',
}

describe('schema de login (AC-003)', () => {
  it('aceita e-mail e senha válidos', () => {
    const result = loginSchema.safeParse({
      email: 'demo@financas.dev',
      password: '123456',
    })

    expect(result.success).toBe(true)
  })

  it('rejeita e-mail inválido e senha curta com mensagens em pt-BR', () => {
    const result = loginSchema.safeParse({ email: 'demo', password: '123' })

    expect(messagesOf(result)).toEqual(
      expect.arrayContaining([
        'Informe um e-mail válido',
        'A senha deve ter ao menos 6 caracteres',
      ]),
    )
  })
})

describe('schema de cadastro (AC-003)', () => {
  it('aceita cadastro completo com CPF e telefone mascarados', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true)
  })

  it('rejeita nome curto, CPF e telefone inválidos', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: 'An',
      cpf: '123',
      phone: '1199',
    })

    expect(messagesOf(result)).toEqual(
      expect.arrayContaining([
        'Informe o nome completo (mínimo 3 caracteres)',
        'Informe um CPF com 11 dígitos',
        'Informe um telefone com DDD (10 ou 11 dígitos)',
      ]),
    )
  })

  it('rejeita confirmação de senha diferente', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: '654321',
    })

    expect(messagesOf(result)).toContain('As senhas não conferem')
  })

  it('rejeita e-mail inválido', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      email: 'ana@',
    })

    expect(messagesOf(result)).toContain('Informe um e-mail válido')
  })
})
