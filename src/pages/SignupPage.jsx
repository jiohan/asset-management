import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'

export default function SignupPage() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)

  return (
    <AuthLayout onBack={() => navigate('/')}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800,
          color: '#111827', letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>
          회원가입
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Monimo 계정을 만들어보세요
        </p>
      </div>

      <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <Field label="닉네임">
          <input
            type="text"
            placeholder="사용할 이름을 입력하세요"
            autoComplete="nickname"
            style={inputStyle}
            onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={e => Object.assign(e.target.style, inputStyle)}
          />
        </Field>

        <Field label="이메일">
          <input
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            style={inputStyle}
            onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={e => Object.assign(e.target.style, inputStyle)}
          />
        </Field>

        <Field label="비밀번호">
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="8자 이상 입력하세요"
              autoComplete="new-password"
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={e => Object.assign(e.target.style, { ...inputFocusStyle, paddingRight: 44 })}
              onBlur={e => Object.assign(e.target.style, { ...inputStyle, paddingRight: 44 })}
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

        <Field label="비밀번호 확인">
          <div style={{ position: 'relative' }}>
            <input
              type={showPwConfirm ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={e => Object.assign(e.target.style, { ...inputFocusStyle, paddingRight: 44 })}
              onBlur={e => Object.assign(e.target.style, { ...inputStyle, paddingRight: 44 })}
            />
            <button
              type="button"
              onClick={() => setShowPwConfirm(v => !v)}
              style={eyeBtnStyle}
              aria-label={showPwConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPwConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          style={submitBtnStyle}
          onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
          onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
        >
          회원가입
        </button>

      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20 }}>
        이미 계정이 있으신가요?{' '}
        <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
          로그인
        </Link>
      </p>
    </AuthLayout>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      {children}
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
