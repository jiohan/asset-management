import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw new Error('거래를 삭제하지 못했습니다.')
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
      queryClient.invalidateQueries({ queryKey: ['month-expense'] })
      queryClient.invalidateQueries({ queryKey: ['account-detail'] })
    },
  })

  async function deleteTransaction(id) {
    try { return await mutateAsync(id) } catch { return false }
  }

  return { deleteTransaction, loading: isPending, error: error?.message ?? null }
}
