import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error: serverError } = useLogin()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPw, setShowPw] = useState(false)

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function validate() {
    const errs = {}
    if (!form.email) errs.email = '이메일을 입력해주세요.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = '올바른 이메일 형식이 아닙니다.'
    if (!form.password) errs.password = '비밀번호를 입력해주세요.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    const ok = await login({ email: form.email, password: form.password })
    if (ok) navigate('/dashboard')
  }

  return (
    <AuthLayout onBack={() => navigate('/')}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800,
          color: '#111827', letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>
          로그인
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Monimo 계정에 로그인하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <Field label="이메일" error={fieldErrors.email}>
          <input
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            style={fieldErrors.email ? { ...inputStyle, ...inputErrorStyle } : inputStyle}
            onFocus={e => Object.assign(e.target.style, fieldErrors.email ? { ...inputFocusStyle, ...inputErrorStyle } : inputFocusStyle)}
            onBlur={e => Object.assign(e.target.style, fieldErrors.email ? { ...inputStyle, ...inputErrorStyle } : inputStyle)}
          />
        </Field>

        <Field label="비밀번호" error={fieldErrors.password}>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              value={form.password}
              onChange={set('password')}
              style={fieldErrors.password ? { ...inputStyle, ...inputErrorStyle, paddingRight: 44 } : { ...inputStyle, paddingRight: 44 }}
              onFocus={e => Object.assign(e.target.style, fieldErrors.password ? { ...inputFocusStyle, ...inputErrorStyle, paddingRight: 44 } : { ...inputFocusStyle, paddingRight: 44 })}
              onBlur={e => Object.assign(e.target.style, fieldErrors.password ? { ...inputStyle, ...inputErrorStyle, paddingRight: 44 } : { ...inputStyle, paddingRight: 44 })}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={eyeBtnStyle}
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        {serverError && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', fontSize: 13,
          }}>
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4338ca' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#4f46e5' }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 24 }}>
        계정이 없으신가요?{' '}
        <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
          회원가입
        </Link>
      </p>
    </AuthLayout>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

const inputStyle = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 9,
  fontSize: 14,
  color: '#111827',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const inputFocusStyle = {
  ...inputStyle,
  borderColor: '#4f46e5',
  boxShadow: '0 0 0 3px rgba(79,70,229,0.12)',
}

const inputErrorStyle = {
  borderColor: '#ef4444',
  boxShadow: '0 0 0 3px rgba(239,68,68,0.1)',
}

const eyeBtnStyle = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#9ca3af',
  display: 'flex',
  alignItems: 'center',
  padding: 4,
  borderRadius: 4,
  transition: 'color 0.15s',
}

const submitBtnStyle = {
  width: '100%',
  height: 46,
  background: '#4f46e5',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s',
  fontFamily: 'inherit',
  marginTop: 4,
}
