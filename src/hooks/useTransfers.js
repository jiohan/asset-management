import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTransfers(month) {
  const { data: transfers = [], isLoading: loading, error } = useQuery({
    queryKey: ['transfers', month],
    queryFn: async () => {
      const [year, mon] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDay = `${month}-${String(new Date(year, mon, 0).getDate()).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('transfers')
        .select('*, from_account:accounts!from_account_id ( id, name, color ), to_account:accounts!to_account_id ( id, name, color )')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw new Error('이체 내역을 불러오지 못했습니다.')
      return data
    },
    enabled: !!month,
    staleTime: 2 * 60 * 1000,
  })
  return { transfers, loading, error: error?.message ?? null }
}
