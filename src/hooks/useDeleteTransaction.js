import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDeleteTransaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function deleteTransaction(id) {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    setLoading(false)

    if (error) {
      setError('거래를 삭제하지 못했습니다.')
      return false
    }

    return true
  }

  return { deleteTransaction, loading, error }
}
