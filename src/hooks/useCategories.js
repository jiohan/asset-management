import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type')
        .order('name')

      setLoading(false)

      if (error) {
        setError('카테고리를 불러오지 못했습니다.')
        return
      }

      setCategories(data)
    }

    fetch()
  }, [])

  return { categories, loading, error }
}
