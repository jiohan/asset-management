import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ userId, fromAccountId, toAccountId, amount, date, note, type = null }) => {
      const { data, error } = await supabase
        .from('transfers')
        .insert({
          user_id: userId,
          from_account_id: fromAccountId,
          to_account_id: toAccountId,
          amount,
          date,
          note: note || null,
          ...(type ? { type } : {}),
        })
        .select('*, from_account:accounts!from_account_id ( id, name, color ), to_account:accounts!to_account_id ( id, name, color )')
        .single()
      if (error) throw new Error('이체를 저장하지 못했습니다.')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
      queryClient.invalidateQueries({ queryKey: ['account-detail'] })
    },
  })

  async function createTransfer(params) {
    try { return await mutateAsync(params) } catch { return null }
  }

  return { createTransfer, loading: isPending, error: error?.message ?? null }
}
