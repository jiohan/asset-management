import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTransfers(month, refreshKey = 0) {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!month) return

    async function load() {
      setLoading(true)
      setError(null)

      const [year, mon] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDate = new Date(year, mon, 0).getDate()
      const lastDay = `${month}-${String(lastDate).padStart(2, '0')}`

      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          from_account:accounts!from_account_id ( id, name, color ),
          to_account:accounts!to_account_id ( id, name, color )
        `)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      setLoading(false)

      if (error) {
        setError('이체 내역을 불러오지 못했습니다.')
        return
      }

      setTransfers(data)
    }

    load()
  }, [month, refreshKey])

  return { transfers, loading, error }
}
