import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const { data: categories = [], isLoading: loading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type')
        .order('name')
      if (error) throw new Error('카테고리를 불러오지 못했습니다.')
      return data
    },
    staleTime: 30 * 60 * 1000,
  })
  return { categories, loading, error: error?.message ?? null }
}
