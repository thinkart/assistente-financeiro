import type { Category, CategoryInput } from '@/types'
import { api } from './api'

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories')

  return data
}

export const createCategory = async (
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await api.post<Category>('/categories', input)

  return data
}

export const updateCategory = async (
  id: string,
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await api.put<Category>(`/categories/${id}`, input)

  return data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`)
}
