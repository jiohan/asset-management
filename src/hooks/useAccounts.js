import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAccounts() {
  const { data: accounts = [], isLoading: loading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw new Error('계좌를 불러오지 못했습니다.')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
  return { accounts, loading, error: error?.message ?? null }
}
