import { act, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AppToaster } from './AppToaster'

describe('AppToaster (AC-010)', () => {
  it('exibe os toasts disparados pela aplicação', async () => {
    render(
      <ThemeProvider>
        <AppToaster />
      </ThemeProvider>,
    )

    act(() => {
      toast.success('Tudo certo')
    })

    expect(await screen.findByText('Tudo certo')).toBeInTheDocument()
  })
})
