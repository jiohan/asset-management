import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function signup({ nickname, email, password }) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: nickname },
      },
    })

    setLoading(false)

    if (error) {
      setError(translateError(error.message))
      return false
    }

    // identities가 빈 배열이면 이미 가입된 이메일 (Supabase 중복 감지 방법)
    if (data.user?.identities?.length === 0) {
      setError('이미 가입된 이메일입니다.')
      return false
    }

    return true
  }

  return { signup, loading, error }
}

function translateError(msg) {
  if (msg.includes('Password should be')) return '비밀번호는 6자 이상이어야 합니다.'
  if (msg.includes('Invalid email')) return '올바른 이메일 형식이 아닙니다.'
  if (msg.includes('rate limit')) return '잠시 후 다시 시도해주세요.'
  return '회원가입 중 오류가 발생했습니다.'
}
