import { axe } from 'vitest-axe'

export const runAxe = (container: Element) =>
  axe(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
