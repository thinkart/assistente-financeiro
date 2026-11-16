import { describe, expect, it } from 'vitest'
import { formatCpf, formatPhone, isValidCpf, isValidPhone } from './personal-data'
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
  cpf: '529.982.247-25',
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
        'O CPF deve conter 11 dígitos.',
        'Informe um telefone válido com DDD, contendo 10 ou 11 dígitos.',
      ]),
    )
  })

  it('valida o CPF pelos dígitos verificadores e rejeita sequências repetidas', () => {
    expect(isValidCpf('52998224725')).toBe(true)
    expect(isValidCpf('52998224724')).toBe(false)
    expect(isValidCpf('11111111111')).toBe(false)
    expect(isValidCpf('5299822472')).toBe(false)
    expect(isValidCpf('529982247250')).toBe(false)
    expect(isValidCpf('529a98224725')).toBe(false)
  })

  it('aplica máscara de CPF durante a digitação ou colagem e ignora caracteres inválidos', () => {
    expect(formatCpf('529')).toBe('529')
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
    expect(formatCpf('529a982-24725')).toBe('529.982.247-25')
    expect(formatCpf('52998224725999')).toBe('529.982.247-25')
  })

  it('valida telefone fixo e celular com DDD brasileiro', () => {
    expect(isValidPhone('1123456789')).toBe(true)
    expect(isValidPhone('11923456789')).toBe(true)
    expect(isValidPhone('0012345678')).toBe(false)
    expect(isValidPhone('1163456789')).toBe(false)
    expect(isValidPhone('1192345678')).toBe(false)
    expect(isValidPhone('119234567890')).toBe(false)
    expect(isValidPhone('11a923456789')).toBe(false)
  })

  it('aplica máscara de telefone durante a digitação ou colagem e ignora caracteres inválidos', () => {
    expect(formatPhone('1123456789')).toBe('(11) 2345-6789')
    expect(formatPhone('11923456789')).toBe('(11) 92345-6789')
    expect(formatPhone('11a92345 6789')).toBe('(11) 92345-6789')
    expect(formatPhone('119234567899')).toBe('(11) 92345-6789')
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
