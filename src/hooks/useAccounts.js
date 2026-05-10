import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('name')

      setLoading(false)

      if (error) {
        setError('계좌를 불러오지 못했습니다.')
        return
      }

      setAccounts(data)
    }

    fetch()
  }, [])

  return { accounts, loading, error }
}
