import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useUpsertBudget() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ categoryId, amount, month }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      let findQuery = supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', month)

      if (categoryId === null || categoryId === undefined) {
        findQuery = findQuery.is('category_id', null)
      } else {
        findQuery = findQuery.eq('category_id', categoryId)
      }

      const { data: existing, error: findErr } = await findQuery.maybeSingle()
      if (findErr) throw new Error('예산을 저장하지 못했습니다.')

      let result, err
      if (existing) {
        ;({ data: result, error: err } = await supabase
          .from('budgets')
          .update({ amount })
          .eq('id', existing.id)
          .select()
          .single())
      } else {
        ;({ data: result, error: err } = await supabase
          .from('budgets')
          .insert({ user_id: user.id, category_id: categoryId ?? null, amount, month })
          .select()
          .single())
      }
      if (err) throw new Error('예산을 저장하지 못했습니다.')
      return result
    },
    onSuccess: (_data, { month }) => {
      queryClient.invalidateQueries({ queryKey: ['month-budget-data', month] })
    },
  })

  async function upsertBudget(params) {
    try { return await mutateAsync(params) } catch { return null }
  }

  return { upsertBudget, loading: isPending, error: error?.message ?? null }
}
