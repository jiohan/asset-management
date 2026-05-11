import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTransactions(month, refreshKey = 0) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!month) return

    async function load() {
      setLoading(true)
      setError(null)

      // month = 'YYYY-MM' → 해당 월의 첫날~말일 범위 계산
      const [year, mon] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDate = new Date(year, mon, 0).getDate()
      const lastDay = `${month}-${String(lastDate).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories ( id, name, icon, type ),
          accounts ( id, name, color )
        `)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      setLoading(false)

      if (error) {
        setError('거래 내역을 불러오지 못했습니다.')
        return
      }

      setTransactions(data)
    }

    load()
  }, [month, refreshKey])

  return { transactions, loading, error }
}
