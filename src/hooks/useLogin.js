import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function login({ email, password }) {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(translateError(error.message))
      return false
    }
    return true
  }

  return { login, loading, error }
}

function translateError(msg) {
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (msg.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 메일함을 확인해주세요.'
  if (msg.includes('rate limit')) return '잠시 후 다시 시도해주세요.'
  return '로그인 중 오류가 발생했습니다.'
}
