import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAccountDetail(accountId, month) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['account-detail', accountId, month],
    queryFn: async () => {
      const [year, mon] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDay = `${month}-${String(new Date(year, mon, 0).getDate()).padStart(2, '0')}`

      const [
        { data: txData, error: txError },
        { data: trData, error: trError },
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(id, name, icon, type)')
          .eq('account_id', accountId)
          .gte('date', firstDay)
          .lte('date', lastDay)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('transfers')
          .select('*, from_account:accounts!from_account_id(id, name, color), to_account:accounts!to_account_id(id, name, color)')
          .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
          .gte('date', firstDay)
          .lte('date', lastDay)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
      ])
      if (txError || trError) throw new Error('내역을 불러오지 못했습니다.')
      return { transactions: txData ?? [], transfers: trData ?? [] }
    },
    enabled: !!(accountId && month),
    staleTime: 2 * 60 * 1000,
  })
  return {
    transactions: data?.transactions ?? [],
    transfers: data?.transfers ?? [],
    loading,
    error: error?.message ?? null,
  }
}
