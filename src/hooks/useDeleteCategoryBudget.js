import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDeleteCategoryBudget() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function deleteCategoryBudget({ id }) {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return false }
    const { error: err } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
    setLoading(false)
    if (err) {
      setError('카테고리 예산을 삭제하지 못했습니다.')
      return false
    }
    return true
  }

  return { deleteCategoryBudget, loading, error }
}
