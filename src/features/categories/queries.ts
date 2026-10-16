import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/auth-context'
import { createCategory, deleteCategory, listCategories, updateCategory } from './api'
import type { CategoryInput } from './types'

export function useCategories() {
  const { session } = useAuth()
  return useQuery({ queryKey: ['finance', session?.user.id, 'categories'], enabled: Boolean(session), queryFn: ({ signal }) => listCategories(signal) })
}
export function useCategoryMutations() {
  const { session } = useAuth()
  const client = useQueryClient()
  const userId = session?.user.id
  const onSuccess = () => client.invalidateQueries({ queryKey: ['finance', userId] })
  return {
    create: useMutation({ mutationFn: createCategory, onSuccess }),
    update: useMutation({ mutationFn: ({ id, value }: { id: string; value: CategoryInput }) => updateCategory(id, value), onSuccess }),
    remove: useMutation({ mutationFn: deleteCategory, onSuccess }),
  }
}
