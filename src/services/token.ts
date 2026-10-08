export const TOKEN_STORAGE_KEY = 'financas-token'

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    /* localStorage indisponível */
    return null
  }
}

export const setStoredToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    /* localStorage indisponível */
  }
}

export const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* localStorage indisponível */
  }
}
