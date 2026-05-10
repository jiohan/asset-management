import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useUpdateTransaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function updateTransaction(id, { categoryId, accountId, amount, type, note, date }) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('transactions')
      .update({
        category_id: categoryId,
        account_id: accountId || null,
        amount: amount,
        type: type,
        note: note || null,
        date: date,
      })
      .eq('id', id)
      .select(`
        *,
        categories ( id, name, icon, type ),
        accounts ( id, name, color )
      `)
      .single()

    setLoading(false)

    if (error) {
      setError('거래를 수정하지 못했습니다.')
      return null
    }

    return data
  }

  return { updateTransaction, loading, error }
}
