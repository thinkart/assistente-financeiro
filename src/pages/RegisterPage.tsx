import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/auth-context'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas'

interface FieldConfig {
  name: keyof RegisterFormData
  label: string
  type: string
  autoComplete: string
}

const fields: FieldConfig[] = [
  { name: 'name', label: 'Nome completo', type: 'text', autoComplete: 'name' },
  { name: 'cpf', label: 'CPF', type: 'text', autoComplete: 'off' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Telefone', type: 'tel', autoComplete: 'tel' },
  {
    name: 'password',
    label: 'Senha',
    type: 'password',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirmar senha',
    type: 'password',
    autoComplete: 'new-password',
  },
]

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null)

    try {
      await signUp({
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      const message =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
          ? error.response.data.message
          : 'Não foi possível criar a conta'

      setSubmitError(message)
    }
  }

  const handleClear = () => {
    reset()
    setSubmitError(null)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Cadastre-se para começar a organizar suas finanças
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </label>
                <Input
                  id={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  {...register(field.name)}
                />
                {errors[field.name] && (
                  <p className="text-sm text-destructive">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Criando…' : 'Criar conta'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleClear}
              >
                Limpar
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
