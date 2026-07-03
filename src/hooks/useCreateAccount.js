import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ userId, name, type, color, initialBalance, paymentAccountId = null }) => {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          name,
          type,
          color,
          initial_balance: initialBalance ?? 0,
          payment_account_id: paymentAccountId ?? null,
        })
        .select('*')
        .single()
      if (error) throw new Error('계좌를 저장하지 못했습니다.')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
    },
  })

  async function createAccount(params) {
    try { return await mutateAsync(params) } catch { return null }
  }

  return { createAccount, loading: isPending, error: error?.message ?? null }
}
