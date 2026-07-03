import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useMonthExpenseByCategory(month) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['month-expense', month],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { expenseByCategory: new Map(), totalExpense: 0 }

      const [y, m] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDay = `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('date', firstDay)
        .lte('date', lastDay)
      if (error) throw new Error('지출 정보를 불러오지 못했습니다.')

      const map = new Map()
      let total = 0
      for (const row of data) {
        map.set(row.category_id, (map.get(row.category_id) ?? 0) + row.amount)
        total += row.amount
      }
      return { expenseByCategory: map, totalExpense: total }
    },
    enabled: !!month,
    staleTime: 2 * 60 * 1000,
  })

  return {
    expenseByCategory: data?.expenseByCategory ?? new Map(),
    totalExpense: data?.totalExpense ?? 0,
    loading,
    error: error?.message ?? null,
  }
}
