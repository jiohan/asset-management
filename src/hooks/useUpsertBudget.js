import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useUpsertBudget() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function upsertBudget({ categoryId, amount, month }) {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return null }

    // Manual select-then-insert/update to handle NULL category_id safely
    let findQuery = supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('month', month)

    if (categoryId === null || categoryId === undefined) {
      findQuery = findQuery.is('category_id', null)
    } else {
      findQuery = findQuery.eq('category_id', categoryId)
    }

    const { data: existing, error: findErr } = await findQuery.maybeSingle()
    if (findErr) { setLoading(false); setError('예산을 저장하지 못했습니다.'); return null }

    let result, err
    if (existing) {
      ;({ data: result, error: err } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existing.id)
        .select()
        .single())
    } else {
      ;({ data: result, error: err } = await supabase
        .from('budgets')
        .insert({ user_id: user.id, category_id: categoryId ?? null, amount, month })
        .select()
        .single())
    }

    setLoading(false)
    if (err) {
      setError('예산을 저장하지 못했습니다.')
      return null
    }
    return result
  }

  return { upsertBudget, loading, error }
}
