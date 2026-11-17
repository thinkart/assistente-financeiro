import type { ApiEnvelope, Category, CategoryInput } from '@/types'
import { api } from './api'

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<ApiEnvelope<Category[]>>('/categories')

  return data.data
}

export const createCategory = async (
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await api.post<ApiEnvelope<Category>>('/categories', input)

  return data.data
}

export const updateCategory = async (
  id: string,
  input: CategoryInput,
): Promise<Category> => {
  const { data } = await api.put<ApiEnvelope<Category>>(
    `/categories/${id}`,
    input,
  )

  return data.data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`)
}
