import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMonthBudget() {
  const [monthlyBudget, setMonthlyBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('monthly_budget')
        .eq('id', user.id)
        .single()

      setLoading(false)

      if (error) {
        setError('예산 정보를 불러오지 못했습니다.')
        return
      }

      setMonthlyBudget(data?.monthly_budget ?? 0)
    }

    load()
  }, [])

  return { monthlyBudget, loading, error }
}
