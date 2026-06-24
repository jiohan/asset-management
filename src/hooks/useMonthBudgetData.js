import { useState, useEffect } from 'react'
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

export function useMonthBudgetData(month, refreshKey = 0) {
  const [totalBudget, setTotalBudget] = useState(0)
  const [categoryBudgets, setCategoryBudgets] = useState([])
  const [isCarriedOver, setIsCarriedOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!month) return
    async function load() {
      setLoading(true)
      setError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data, error: err } = await supabase
        .from('budgets')
        .select('*, categories(id, name, icon)')
        .eq('user_id', user.id)
        .eq('month', month)

      if (err) {
        setError('예산 정보를 불러오지 못했습니다.')
        setLoading(false)
        return
      }

      if (data.length > 0) {
        const shaped = shapeBudgets(data, false)
        setTotalBudget(shaped.totalBudget)
        setCategoryBudgets(shaped.categoryBudgets)
        setIsCarriedOver(false)
      } else {
        const prev = prevMonthStr(month)
        const { data: prevData, error: prevErr } = await supabase
          .from('budgets')
          .select('*, categories(id, name, icon)')
          .eq('user_id', user.id)
          .eq('month', prev)

        if (!prevErr && prevData.length > 0) {
          const shaped = shapeBudgets(prevData, true)
          setTotalBudget(shaped.totalBudget)
          setCategoryBudgets(shaped.categoryBudgets)
          setIsCarriedOver(true)
        } else {
          setTotalBudget(0)
          setCategoryBudgets([])
          setIsCarriedOver(false)
          if (prevErr) setError('예산 정보를 불러오지 못했습니다.')
        }
      }
      setLoading(false)
    }
    load()
  }, [month, refreshKey])

  return { totalBudget, categoryBudgets, isCarriedOver, loading, error }
}
