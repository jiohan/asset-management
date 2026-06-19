import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDeleteAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function deleteAccount(id) {
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id)

    setLoading(false)

    if (error) {
      setError('계좌를 삭제하지 못했습니다.')
      return false
    }

    return true
  }

  return { deleteAccount, loading, error }
}
