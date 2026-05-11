import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCreateTransfer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createTransfer({ userId, fromAccountId, toAccountId, amount, date, note }) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('transfers')
      .insert({
        user_id: userId,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        date,
        note: note || null,
      })
      .select(`
        *,
        from_account:accounts!from_account_id ( id, name, color ),
        to_account:accounts!to_account_id ( id, name, color )
      `)
      .single()

    setLoading(false)

    if (error) {
      setError('이체를 저장하지 못했습니다.')
      return null
    }

    return data
  }

  return { createTransfer, loading, error }
}
