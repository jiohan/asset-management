import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useMonthBudget() {
  const { data: monthlyBudget = null, isLoading: loading, error } = useQuery({
    queryKey: ['month-budget-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_budget')
        .eq('id', user.id)
        .single()
      if (error) throw new Error('예산 정보를 불러오지 못했습니다.')
      return data?.monthly_budget ?? 0
    },
    staleTime: 10 * 60 * 1000,
  })
  return { monthlyBudget, loading, error: error?.message ?? null }
}
