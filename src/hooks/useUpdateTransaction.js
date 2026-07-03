import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, categoryId, accountId, amount, type, note, date }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          category_id: categoryId,
          account_id: accountId || null,
          amount,
          type,
          note: note || null,
          date,
        })
        .eq('id', id)
        .select('*, categories ( id, name, icon, type ), accounts ( id, name, color )')
        .single()
      if (error) throw new Error('거래를 수정하지 못했습니다.')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
      queryClient.invalidateQueries({ queryKey: ['month-expense'] })
      queryClient.invalidateQueries({ queryKey: ['account-detail'] })
    },
  })

  async function updateTransaction(id, fields) {
    try { return await mutateAsync({ id, ...fields }) } catch { return null }
  }

  return { updateTransaction, loading: isPending, error: error?.message ?? null }
}
