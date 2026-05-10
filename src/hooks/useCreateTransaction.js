import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCreateTransaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createTransaction({ userId, categoryId, accountId, amount, type, note, date }) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        account_id: accountId || null,
        amount: amount,
        type: type,
        note: note || null,
        date: date,
      })
      .select(`
        *,
        categories ( id, name, icon, type ),
        accounts ( id, name, color )
      `)
      .single()

    setLoading(false)

    if (error) {
      setError('거래를 저장하지 못했습니다.')
      return null
    }

    return data
  }

  return { createTransaction, loading, error }
}
