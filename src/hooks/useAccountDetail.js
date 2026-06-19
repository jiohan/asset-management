import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAccountDetail(accountId, month, refreshKey = 0) {
  const [transactions, setTransactions] = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!accountId || !month) return

    async function load() {
      setLoading(true)
      setError(null)

      const [year, mon] = month.split('-').map(Number)
      const firstDay = `${month}-01`
      const lastDate = new Date(year, mon, 0).getDate()
      const lastDay = `${month}-${String(lastDate).padStart(2, '0')}`

      const [
        { data: txData, error: txError },
        { data: trData, error: trError },
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(id, name, icon, type)')
          .eq('account_id', accountId)
          .gte('date', firstDay)
          .lte('date', lastDay)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('transfers')
          .select('*, from_account:accounts!from_account_id(id, name, color), to_account:accounts!to_account_id(id, name, color)')
          .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
          .gte('date', firstDay)
          .lte('date', lastDay)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
      ])

      setLoading(false)

      if (txError || trError) {
        setError('내역을 불러오지 못했습니다.')
        return
      }

      setTransactions(txData ?? [])
      setTransfers(trData ?? [])
    }

    load()
  }, [accountId, month, refreshKey])

  return { transactions, transfers, loading, error }
}
