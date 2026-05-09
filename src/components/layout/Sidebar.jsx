// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: '대시보드',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M3 13l4-4 4 4 7-7M14 6h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/ledger',
    label: '거래 내역',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/budget',
    label: '예산',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/accounts',
    label: '계좌',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { session } = useAuth()

  const displayName = session?.user?.user_metadata?.display_name ?? ''
  const email = session?.user?.email ?? ''
  const initials = (displayName || email).slice(0, 2).toUpperCase()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-[232px] shrink-0 bg-white border-r border-gray-200 flex flex-col">

      {/* 로고 */}
      <div className="px-5 h-14 flex items-center gap-2 border-b border-gray-200">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
            <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-bold text-[15px] tracking-tight">Monimo</span>
        <span className="ml-auto text-[10px] text-gray-400 font-medium">v1</span>
      </div>

      {/* 새 거래 추가 버튼 (Phase 5 전 비활성) */}
      <div className="p-3">
        <button
          disabled
          className="w-full h-8 bg-indigo-600 text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          새 거래 추가
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="px-3 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-2 mb-1.5">
          메인
        </p>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}

        {/* 계좌 섹션 — 빈 상태 */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-5 mb-1.5">
          계좌
        </p>
        <div className="mx-1 px-3 py-3 border border-dashed border-gray-200 rounded-lg text-center">
          <p className="text-[12px] text-gray-400">계좌가 없어요</p>
          <p className="text-[11px] text-gray-300 mt-0.5">Phase 6에서 추가됩니다</p>
        </div>
      </nav>

      {/* 유저 프로필 */}
      <div className="mt-auto p-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[12px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold truncate">{displayName || email}</p>
            <p className="text-[11px] text-gray-500 truncate">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            title="로그아웃"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.5c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
          </button>
        </div>
      </div>

    </aside>
  )
}
