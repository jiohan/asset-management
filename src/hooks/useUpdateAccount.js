import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useUpdateAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function updateAccount(id, { name, type, color, initialBalance }) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('accounts')
      .update({
        name,
        type,
        color,
        initial_balance: initialBalance ?? 0,
      })
      .eq('id', id)
      .select('*')
      .single()

    setLoading(false)

    if (error) {
      setError('계좌를 수정하지 못했습니다.')
      return null
    }

    return data
  }

  return { updateAccount, loading, error }
}
