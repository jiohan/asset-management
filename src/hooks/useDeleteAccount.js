import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('accounts').update({ is_active: false }).eq('id', id)
      if (error) throw new Error('계좌를 삭제하지 못했습니다.')
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-with-balance'] })
    },
  })

  async function deleteAccount(id) {
    try { return await mutateAsync(id) } catch { return false }
  }

  return { deleteAccount, loading: isPending, error: error?.message ?? null }
}
