import { vi } from 'vitest'

export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

type ChangeListener = (event: MediaQueryListEvent) => void

const listenersByQuery = new Map<string, Set<ChangeListener>>()
let prefersDark = false

export const createMatchMedia = (query: string): MediaQueryList => {
  const listeners = listenersByQuery.get(query) ?? new Set<ChangeListener>()
  listenersByQuery.set(query, listeners)

  const mediaQueryList = {
    media: query,
    get matches() {
      return query === DARK_MEDIA_QUERY ? prefersDark : false
    },
    onchange: null,
    addEventListener: vi.fn((type: string, listener: ChangeListener) => {
      if (type === 'change') listeners.add(listener)
    }),
    removeEventListener: vi.fn((type: string, listener: ChangeListener) => {
      if (type === 'change') listeners.delete(listener)
    }),
    addListener: vi.fn((listener: ChangeListener) => listeners.add(listener)),
    removeListener: vi.fn((listener: ChangeListener) =>
      listeners.delete(listener),
    ),
    dispatchEvent: vi.fn(() => true),
  }

  return mediaQueryList as unknown as MediaQueryList
}

export const setPrefersDark = (matches: boolean) => {
  prefersDark = matches
  const event = {
    matches,
    media: DARK_MEDIA_QUERY,
  } as MediaQueryListEvent

  for (const listeners of listenersByQuery.values()) {
    for (const listener of listeners) listener(event)
  }
}

export const resetMatchMedia = () => {
  prefersDark = false
  listenersByQuery.clear()
}
