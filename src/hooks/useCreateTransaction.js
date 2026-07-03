import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ userId, categoryId, accountId, amount, type, note, date }) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          category_id: categoryId,
          account_id: accountId || null,
          amount,
          type,
          note: note || null,
          date,
        })
        .select('*, categories ( id, name, icon, type ), accounts ( id, name, color )')
        .single()
      if (error) throw new Error('거래를 저장하지 못했습니다.')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
      queryClient.invalidateQueries({ queryKey: ['month-expense'] })
      queryClient.invalidateQueries({ queryKey: ['account-detail'] })
    },
  })

  async function createTransaction(params) {
    try { return await mutateAsync(params) } catch { return null }
  }

  return { createTransaction, loading: isPending, error: error?.message ?? null }
}
