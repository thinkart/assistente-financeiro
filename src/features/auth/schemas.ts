import { z } from 'zod'
import { isValidCpf, isValidPhone, onlyDigits } from './personal-data'

const cpfSchema = z.string().superRefine((value, context) => {
  if (onlyDigits(value).length !== 11) {
    context.addIssue({ code: 'custom', message: 'O CPF deve conter 11 dígitos.' })
  } else if (!isValidCpf(value)) {
    context.addIssue({
      code: 'custom',
      message: 'CPF inválido. Verifique os números informados.',
    })
  }
})

const phoneSchema = z.string().refine(isValidPhone, {
  message: 'Informe um telefone válido com DDD, contendo 10 ou 11 dígitos.',
})

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
    cpf: cpfSchema,
    email: z.email({ message: 'Informe um e-mail válido' }),
    phone: phoneSchema,
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe o nome completo (mínimo 3 caracteres)'),
  cpf: cpfSchema,
  email: z.email({ message: 'Informe um e-mail válido' }),
  phone: phoneSchema,
})

export type ProfileFormData = z.infer<typeof profileSchema>
