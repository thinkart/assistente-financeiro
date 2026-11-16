import { zodResolver } from '@hookform/resolvers/zod'
import { Download, FileSpreadsheet, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
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
import { profileSchema, type ProfileFormData } from '@/features/auth/schemas'
import {
  formatCpf,
  formatPhone,
  handleMaskedInputChange,
  normalizePersonalData,
} from '@/features/auth/personal-data'
import { updateProfileRequest } from '@/features/auth/service'
import { getApiErrorMessage } from '@/services/api'
import {
  downloadTransactionsCsv,
  downloadTransactionsPdf,
} from '@/services/reports'

const NOT_INFORMED = 'Não informado'

export function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth()
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [isExportingCsv, setIsExportingCsv] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isEditing = location.pathname === '/perfil/editar'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', cpf: '', phone: '' },
  })
  const cpfRegistration = register('cpf')
  const phoneRegistration = register('phone')

  useEffect(() => {
    if (!user) return

    reset({
      name: user.name,
      email: user.email,
      cpf: formatCpf(user.cpf),
      phone: formatPhone(user.phone),
    })
  }, [user, reset])

  const handleEdit = () => {
    setSubmitError(null)

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        cpf: formatCpf(user.cpf),
        phone: formatPhone(user.phone),
      })
    }

    navigate('/perfil/editar')
  }

  const handleCancel = () => {
    setSubmitError(null)
    navigate('/perfil')

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        cpf: formatCpf(user.cpf),
        phone: formatPhone(user.phone),
      })
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setSubmitError(null)

    try {
      const updatedUser = await updateProfileRequest({
        ...data,
        cpf: normalizePersonalData(data.cpf),
        phone: normalizePersonalData(data.phone),
      })
      updateUser(updatedUser)
      navigate('/perfil')
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Não foi possível atualizar o perfil',
      )
      setSubmitError(message)
      toast.error(message)
    }
  }

  const saveDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true)

    try {
      const { blob, filename } = await downloadTransactionsPdf()
      saveDownload(blob, filename)
      toast.success('PDF gerado com sucesso!')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Não foi possível gerar o relatório em PDF'),
      )
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleDownloadCsv = async () => {
    setIsExportingCsv(true)

    try {
      const { blob, filename } = await downloadTransactionsCsv()
      saveDownload(blob, filename)
      toast.success('CSV gerado com sucesso!')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Não foi possível gerar o relatório em CSV'),
      )
    } finally {
      setIsExportingCsv(false)
    }
  }

  if (isLoading) {
    return (
      <p
        role="status"
        className="py-8 text-center text-sm text-muted-foreground"
      >
        Carregando perfil…
      </p>
    )
  }

  if (!user) {
    return (
      <p
        role="status"
        className="py-8 text-center text-sm text-muted-foreground"
      >
        Não foi possível carregar os dados do perfil.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {isEditing ? 'Editar conta' : 'Perfil'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? 'Atualize seus dados de cadastro.'
            : 'Gerencie seus dados pessoais e exporte suas transações.'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-lg">Dados pessoais</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Atualize os dados da sua conta.'
                : 'Informações da sua conta.'}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Pencil />
              Editar perfil
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="space-y-2">
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Nome completo
                </label>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="profile-email" className="text-sm font-medium">
                    E-mail
                  </label>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-cpf" className="text-sm font-medium">
                    CPF
                  </label>
                  <Input
                    id="profile-cpf"
                    inputMode="numeric"
                    autoComplete="off"
                    {...cpfRegistration}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleMaskedInputChange(
                        event,
                        cpfRegistration.onChange,
                        formatCpf,
                      )
                    }
                  />
                  {errors.cpf && (
                    <p className="text-sm text-destructive">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-phone" className="text-sm font-medium">
                    Telefone
                  </label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    {...phoneRegistration}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleMaskedInputChange(
                        event,
                        phoneRegistration.onChange,
                        formatPhone,
                      )
                    }
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando…' : 'Salvar'}
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Nome completo
                </dt>
                <dd className="mt-1 break-words">{user.name || NOT_INFORMED}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  E-mail
                </dt>
                <dd className="mt-1 break-words">
                  {user.email || NOT_INFORMED}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  CPF
                </dt>
                <dd className="mt-1">{formatCpf(user.cpf)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Telefone
                </dt>
                <dd className="mt-1">{formatPhone(user.phone)}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exportar dados</CardTitle>
            <CardDescription>
              Baixe um relatório em PDF com o resumo das suas transações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
              >
                <Download />
                {isExportingPdf ? 'Gerando PDF…' : 'Baixar PDF'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadCsv}
                disabled={isExportingCsv}
              >
                <FileSpreadsheet />
                {isExportingCsv ? 'Gerando CSV…' : 'Baixar CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
