import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTransactions(month) {
  const { data: transactions = [], isLoading: loading, error } = useQuery({
    queryKey: ['transactions', month],
    queryFn: async () => {
      const [year, mon] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDay = `${month}-${String(new Date(year, mon, 0).getDate()).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories ( id, name, icon, type ), accounts ( id, name, color )')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw new Error('거래 내역을 불러오지 못했습니다.')
      return data
    },
    enabled: !!month,
    staleTime: 2 * 60 * 1000,
  })
  return { transactions, loading, error: error?.message ?? null }
}
