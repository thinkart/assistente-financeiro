import type { Category } from '@/types'
import { api } from './api'

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories')

  return data
}
