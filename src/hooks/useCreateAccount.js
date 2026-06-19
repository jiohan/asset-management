import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCreateAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createAccount({ userId, name, type, color, initialBalance }) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name,
        type,
        color,
        initial_balance: initialBalance ?? 0,
      })
      .select('*')
      .single()

    setLoading(false)

    if (error) {
      setError('계좌를 저장하지 못했습니다.')
      return null
    }

    return data
  }

  return { createAccount, loading, error }
}
