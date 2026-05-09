# Phase 4 — 기본 레이아웃 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sidebar + AppHeader + AppLayout 컴포넌트를 구축하고 React Router로 4개 인증 페이지를 연결한다.

**Architecture:** AppLayout이 Sidebar와 AppHeader를 조합하는 단일 래퍼 역할을 한다. App.jsx의 PrivateRoute 안에서 각 페이지를 AppLayout으로 감싸는 구조. 계좌 섹션은 빈 상태, 로그아웃은 ⚙ 클릭 즉시 실행.

**Tech Stack:** React 18, React Router v6, Tailwind CSS, Supabase Auth

---

## 파일 맵

| 파일 | 작업 | 역할 |
|------|------|------|
| `src/components/layout/AppLayout.jsx` | 신규 | Sidebar + AppHeader + children 조합 |
| `src/components/layout/Sidebar.jsx` | 신규 | 사이드바 전체 (nav, 계좌, 유저 프로필) |
| `src/components/layout/AppHeader.jsx` | 신규 | 상단 헤더 (페이지 제목) |
| `src/pages/DashboardPage.jsx` | 신규 | 빈 껍데기 페이지 |
| `src/pages/LedgerPage.jsx` | 신규 | 빈 껍데기 페이지 |
| `src/pages/BudgetPage.jsx` | 신규 | 빈 껍데기 페이지 |
| `src/pages/AccountsPage.jsx` | 신규 | 빈 껍데기 페이지 |
| `src/App.jsx` | 수정 | PlaceholderPage 제거, AppLayout + 실제 페이지 연결 |

---

## Task 1: AppLayout 컴포넌트

**Files:**
- Create: `src/components/layout/AppLayout.jsx`

- [ ] **Step 1: 파일 생성**

```jsx
// src/components/layout/AppLayout.jsx
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'

export default function AppLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader title={title} />
        <main className="flex-1 min-h-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/layout/AppLayout.jsx
git commit -m "feat: add AppLayout wrapper component"
```

---

## Task 2: AppHeader 컴포넌트

**Files:**
- Create: `src/components/layout/AppHeader.jsx`

- [ ] **Step 1: 파일 생성**

```jsx
// src/components/layout/AppHeader.jsx
export default function AppHeader({ title }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center shrink-0">
      <h1 className="text-[15px] font-semibold text-gray-900">{title}</h1>
    </header>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/layout/AppHeader.jsx
git commit -m "feat: add AppHeader component"
```

---

## Task 3: Sidebar 컴포넌트

**Files:**
- Create: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: 파일 생성**

디자인 기준: `docs/design-system.md` §5, `Monimo Ledger.html` Sidebar 섹션

```jsx
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
```

- [ ] **Step 2: 커밋**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: add Sidebar component with nav, empty accounts, logout"
```

---

## Task 4: 빈 페이지 컴포넌트 4개

**Files:**
- Create: `src/pages/DashboardPage.jsx`
- Create: `src/pages/LedgerPage.jsx`
- Create: `src/pages/BudgetPage.jsx`
- Create: `src/pages/AccountsPage.jsx`

- [ ] **Step 1: DashboardPage 생성**

```jsx
// src/pages/DashboardPage.jsx
export default function DashboardPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600">
            <path d="M3 13l4-4 4 4 7-7M14 6h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-700">대시보드</p>
        <p className="text-[13px] text-gray-400 mt-1">Phase 8에서 구현됩니다</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: LedgerPage 생성**

```jsx
// src/pages/LedgerPage.jsx
export default function LedgerPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-700">거래 내역</p>
        <p className="text-[13px] text-gray-400 mt-1">Phase 5에서 구현됩니다</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: BudgetPage 생성**

```jsx
// src/pages/BudgetPage.jsx
export default function BudgetPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-700">예산</p>
        <p className="text-[13px] text-gray-400 mt-1">Phase 7에서 구현됩니다</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: AccountsPage 생성**

```jsx
// src/pages/AccountsPage.jsx
export default function AccountsPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-700">계좌</p>
        <p className="text-[13px] text-gray-400 mt-1">Phase 6에서 구현됩니다</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 커밋**

```bash
git add src/pages/DashboardPage.jsx src/pages/LedgerPage.jsx src/pages/BudgetPage.jsx src/pages/AccountsPage.jsx
git commit -m "feat: add empty placeholder page components"
```

---

## Task 5: App.jsx 라우팅 업데이트

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: App.jsx 전체 교체**

PlaceholderPage와 기존 Route들을 제거하고 AppLayout + 실제 페이지로 교체한다.

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import LedgerPage from './pages/LedgerPage'
import BudgetPage from './pages/BudgetPage'
import AccountsPage from './pages/AccountsPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout title="대시보드"><DashboardPage /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <PrivateRoute>
                <AppLayout title="거래 내역"><LedgerPage /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <PrivateRoute>
                <AppLayout title="예산"><BudgetPage /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <PrivateRoute>
                <AppLayout title="계좌"><AccountsPage /></AppLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function PrivateRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default App
```

- [ ] **Step 2: 커밋**

```bash
git add src/App.jsx
git commit -m "feat: wire AppLayout and real pages into router"
```

---

## Task 6: 브라우저 검증

- [ ] **Step 1: 개발 서버 시작**

```bash
npm run dev
```

`http://localhost:5173` 접속

- [ ] **Step 2: 비로그인 보호 확인**

브라우저에서 `http://localhost:5173/dashboard` 직접 입력  
→ `/login` 으로 리디렉션 되어야 함

- [ ] **Step 3: 로그인 후 레이아웃 확인**

1. `/login` 에서 이메일/비밀번호 로그인
2. 사이드바가 좌측에, 헤더가 상단에 렌더링되는지 확인
3. 사이드바 유저 프로필 영역에 이메일/닉네임이 표시되는지 확인

- [ ] **Step 4: Nav 이동 확인**

사이드바에서 순서대로 클릭:
- 대시보드 → URL `/dashboard`, 헤더 "대시보드", active 하이라이트 ✓
- 거래 내역 → URL `/ledger`, 헤더 "거래 내역", active 하이라이트 ✓
- 예산 → URL `/budget`, 헤더 "예산", active 하이라이트 ✓
- 계좌 → URL `/accounts`, 헤더 "계좌", active 하이라이트 ✓

- [ ] **Step 5: 계좌 섹션 빈 상태 확인**

사이드바 계좌 섹션에 "계좌가 없어요" 텍스트가 dashed 보더 안에 표시되는지 확인

- [ ] **Step 6: 로그아웃 확인**

사이드바 하단 ⚙ 아이콘 클릭 → `/login` 으로 리디렉션 되어야 함

- [ ] **Step 7: 최종 커밋**

모든 동작 확인 후:

```bash
git add -A
git commit -m "feat: Phase 4 layout complete — Sidebar, AppHeader, AppLayout, routing"
```
