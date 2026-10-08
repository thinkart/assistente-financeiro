import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/services/categories'
import type { CategoryInput } from '@/types'

export const categoriesQueryKey = ['categories'] as const

export const useCategories = () =>
  useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
  })

const useInvalidateCategories = () => {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
}

export const useCreateCategory = () => {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: invalidate,
  })
}

export const useUpdateCategory = () => {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      updateCategory(id, input),
    onSuccess: invalidate,
  })
}

export const useDeleteCategory = () => {
  const invalidate = useInvalidateCategories()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  })
}
