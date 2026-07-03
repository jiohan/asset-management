import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

function prevMonthStr(ym) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function shapeBudgets(rows, nullifyId = false) {
  let totalBudget = 0
  const categoryBudgets = []
  for (const row of rows) {
    if (row.category_id === null) {
      totalBudget = row.amount
    } else {
      categoryBudgets.push({
        id: nullifyId ? null : row.id,
        categoryId: row.category_id,
        amount: row.amount,
        categoryName: row.categories?.name ?? '',
        categoryIcon: row.categories?.icon ?? '',
      })
    }
  }
  return { totalBudget, categoryBudgets }
}

export function useMonthBudgetData(month) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['month-budget-data', month],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { totalBudget: 0, categoryBudgets: [], isCarriedOver: false }

      const { data, error } = await supabase
        .from('budgets')
        .select('*, categories(id, name, icon)')
        .eq('user_id', user.id)
        .eq('month', month)
      if (error) throw new Error('예산 정보를 불러오지 못했습니다.')

      if (data.length > 0) {
        return { ...shapeBudgets(data, false), isCarriedOver: false }
      }

      const prev = prevMonthStr(month)
      const { data: prevData, error: prevErr } = await supabase
        .from('budgets')
        .select('*, categories(id, name, icon)')
        .eq('user_id', user.id)
        .eq('month', prev)
      if (prevErr) throw new Error('예산 정보를 불러오지 못했습니다.')

      if (prevData.length > 0) {
        return { ...shapeBudgets(prevData, true), isCarriedOver: true }
      }

      return { totalBudget: 0, categoryBudgets: [], isCarriedOver: false }
    },
    enabled: !!month,
    staleTime: 5 * 60 * 1000,
  })

  const defaultData = { totalBudget: 0, categoryBudgets: [], isCarriedOver: false }
  return {
    totalBudget: data?.totalBudget ?? defaultData.totalBudget,
    categoryBudgets: data?.categoryBudgets ?? defaultData.categoryBudgets,
    isCarriedOver: data?.isCarriedOver ?? defaultData.isCarriedOver,
    loading,
    error: error?.message ?? null,
  }
}
