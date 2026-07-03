import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDeleteCategoryBudget() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, month }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw new Error('카테고리 예산을 삭제하지 못했습니다.')
      return { month }
    },
    onSuccess: ({ month }) => {
      queryClient.invalidateQueries({ queryKey: ['month-budget-data', month] })
    },
  })

  async function deleteCategoryBudget(params) {
    try { await mutateAsync(params); return true } catch { return false }
  }

  return { deleteCategoryBudget, loading: isPending, error: error?.message ?? null }
}
