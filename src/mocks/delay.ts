import { delay } from 'msw'

export const resolveMockDelay = (mode: string) => (mode === 'test' ? 0 : 300)

export const MOCK_DELAY_MS = resolveMockDelay(import.meta.env.MODE)

export const applyMockDelay = () => delay(MOCK_DELAY_MS)
