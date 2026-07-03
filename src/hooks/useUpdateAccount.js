import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ id, name, type, color, initialBalance, paymentAccountId = null }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          name,
          type,
          color,
          initial_balance: initialBalance ?? 0,
          payment_account_id: paymentAccountId ?? null,
        })
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw new Error('계좌를 수정하지 못했습니다.')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
    },
  })

  async function updateAccount(id, fields) {
    try { return await mutateAsync({ id, ...fields }) } catch { return null }
  }

  return { updateAccount, loading: isPending, error: error?.message ?? null }
}
