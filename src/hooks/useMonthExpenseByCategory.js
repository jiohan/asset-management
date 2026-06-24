import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMonthExpenseByCategory(month, refreshKey = 0) {
  const [expenseByCategory, setExpenseByCategory] = useState(new Map())
  const [totalExpense, setTotalExpense] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!month) return
    async function load() {
      setLoading(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [y, m] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDay = new Date(y, m, 0).getDate()
      const lastDayStr = `${month}-${String(lastDay).padStart(2, '0')}`

      const { data, error: err } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('date', firstDay)
        .lte('date', lastDayStr)

      setLoading(false)
      if (err) {
        setError('지출 정보를 불러오지 못했습니다.')
        return
      }

      const map = new Map()
      let total = 0
      for (const row of data) {
        const prev = map.get(row.category_id) ?? 0
        map.set(row.category_id, prev + row.amount)
        total += row.amount
      }
      setExpenseByCategory(map)
      setTotalExpense(total)
    }
    load()
  }, [month, refreshKey])

  return { expenseByCategory, totalExpense, loading, error }
}
