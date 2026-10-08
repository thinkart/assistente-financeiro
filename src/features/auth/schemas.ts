import { z } from 'zod'

const onlyDigits = (value: string) => value.replace(/\D/g, '')

export const loginSchema = z.object({
  email: z.email({ message: 'Informe um e-mail válido' }),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Informe o nome completo (mínimo 3 caracteres)'),
    cpf: z
      .string()
      .refine(
        (value) => onlyDigits(value).length === 11,
        'Informe um CPF com 11 dígitos',
      ),
    email: z.email({ message: 'Informe um e-mail válido' }),
    phone: z.string().refine((value) => {
      const digits = onlyDigits(value).length
      return digits >= 10 && digits <= 11
    }, 'Informe um telefone com DDD (10 ou 11 dígitos)'),
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
