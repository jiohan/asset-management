# Phase 5-2: 거래 추가 폼 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 "새 거래 추가" 버튼을 클릭하면 모달이 열리고, 지출/수입 유형·금액·카테고리·날짜·계좌·메모를 입력한 뒤 저장하면 Supabase에 실제로 저장되는 거래 입력 폼을 구축한다.

**Architecture:** AppLayout이 모달 열기/닫기 상태(showModal)를 관리하고, Sidebar의 "새 거래 추가" 버튼으로 트리거한다. TransactionFormModal은 자체적으로 폼 상태를 관리하며, Phase 5-1에서 작성한 훅(useCreateTransaction, useCategories)과 신규 작성할 useAccounts를 조합해 저장한다. userId는 기존 AuthContext(useAuth)에서 가져온다.

**Tech Stack:** React 18, Tailwind CSS v4, Supabase JS v2, Playwright MCP (이미 설치됨 — `@playwright/test` 설치 불필요, MCP 도구로 브라우저 직접 제어)

---

## 디자인 원칙 (ui-ux-pro-max 기준)

| 항목 | 적용 값 |
|------|---------|
| 모달 진입 애니메이션 | `opacity-0 scale-95` → `opacity-100 scale-100`, 150ms ease-out |
| 모달 너비 | `w-[480px] max-w-[90vw]` |
| 지출 활성 색 | `bg-red-50 text-red-600` |
| 수입 활성 색 | `bg-blue-50 text-blue-600` |
| 금액 입력 높이 | 48px, mono 24px bold, 우측 정렬 |
| 카테고리 셀 최소 크기 | 60px 높이, 4열 그리드 (touch ≥44px 준수) |
| 선택된 카테고리 | `bg-indigo-50 border-indigo-500 border-[1.5px]` |
| 저장 버튼 로딩 | disabled + SVG spinner |
| 에러 표시 위치 | 폼 상단 인라인 (error-placement 규칙) |
| cursor-pointer | 모든 클릭 가능 요소 필수 |

---

## 파일 구조

### 신규 생성
| 파일 | 역할 |
|------|------|
| `playwright.config.js` | Playwright E2E 설정 |
| `tests/e2e/transaction-form.spec.js` | 거래 추가 폼 E2E 테스트 전체 |
| `src/components/ui/Modal.jsx` | 재사용 베이스 모달 (overlay, 애니메이션, Escape 닫기) |
| `src/components/transactions/TransactionFormModal.jsx` | 거래 폼 전체 컴포넌트 |
| `src/hooks/useAccounts.js` | 계좌 목록 조회 훅 |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `src/components/layout/AppLayout.jsx` | `showModal` state 추가, Sidebar에 prop 전달, TransactionFormModal 렌더링 |
| `src/components/layout/Sidebar.jsx` | "새 거래 추가" 버튼 `disabled` 제거, `onAddTransaction` prop 호출 |

---

## Task 1: 개발 서버 확인 (Playwright MCP 사용 준비)

> Playwright MCP가 이미 설치되어 있으므로 `@playwright/test` 패키지 설치 불필요.
> 각 Task의 Playwright 검증은 MCP 도구(`mcp__playwright__browser_*`)로 직접 수행.

**Files:** 없음

- [ ] **Step 1: 개발 서버 실행**

```bash
npm run dev
```

Expected: `http://localhost:5173` 에서 앱 정상 실행

- [ ] **Step 2: Playwright MCP로 앱 접속 확인**

`mcp__playwright__browser_navigate` → `http://localhost:5173`
`mcp__playwright__browser_take_screenshot` → 로그인 페이지 스크린샷 확인

---

## Task 2: Modal.jsx 베이스 컴포넌트 + AppLayout/Sidebar 연결

**Files:**
- Create: `src/components/ui/Modal.jsx`
- Modify: `src/components/layout/AppLayout.jsx`
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Modal.jsx 생성**

```jsx
// src/components/ui/Modal.jsx
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <div
      data-testid="modal-overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-150
        ${isOpen
          ? 'bg-black/40 backdrop-blur-sm pointer-events-auto'
          : 'bg-transparent backdrop-blur-none pointer-events-none'
        }`}
      onClick={onClose}
    >
      <div
        className={`w-[480px] max-w-[90vw] bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]
          transition-all duration-150
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: AppLayout.jsx 수정 — showModal 상태 + TransactionFormModal 렌더링**

```jsx
// src/components/layout/AppLayout.jsx
import { useState } from 'react'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import TransactionFormModal from '../transactions/TransactionFormModal'

export default function AppLayout({ children, title }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onAddTransaction={() => setShowModal(true)} />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader title={title} />
        <main className="flex-1 min-h-0 flex flex-col">
          {children}
        </main>
      </div>
      <TransactionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setShowModal(false)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Sidebar.jsx 수정 — 버튼 disabled 제거, onAddTransaction prop 연결**

`Sidebar.jsx` 47번째 줄의 함수 시그니처를 바꾸고, 버튼 부분을 교체:

```jsx
export default function Sidebar({ onAddTransaction }) {
```

그리고 74번~83번 줄의 버튼을 아래로 교체:

```jsx
      <div className="p-3">
        <button
          onClick={onAddTransaction}
          className="w-full h-8 bg-indigo-600 text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          새 거래 추가
        </button>
      </div>
```

- [ ] **Step 4: 임시 TransactionFormModal 생성 (Task 3에서 완성)**

Task 3 작업 전까지 import 오류 방지용 최소 파일:

```jsx
// src/components/transactions/TransactionFormModal.jsx
import Modal from '../ui/Modal'

export default function TransactionFormModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-[15px] font-semibold text-gray-900">새 거래 추가</h2>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="px-5 py-8 text-center text-[13px] text-gray-400">
        폼 구현 중...
      </div>
    </Modal>
  )
}
```

- [ ] **Step 5: 브라우저 직접 확인**

```bash
npm run dev
```

localhost:5173 접속 → 로그인 → "새 거래 추가" 버튼 클릭 → 모달 열림/닫힘 확인

- [ ] **Step 6: Task 2 범위 Playwright 테스트 실행 → 통과 확인**

```bash
$env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"; npx playwright test --grep "모달 열림|닫기|overlay|Escape" --reporter=line
```

Expected: 4개 테스트 PASS

- [ ] **Step 7: 커밋**

```bash
git add src/components/ui/Modal.jsx src/components/layout/AppLayout.jsx src/components/layout/Sidebar.jsx src/components/transactions/TransactionFormModal.jsx
git commit -m "feat: add base Modal component and transaction modal trigger"
```

---

## Task 3: TransactionFormModal 기본 레이아웃 (폼 껍데기)

**Files:**
- Modify: `src/components/transactions/TransactionFormModal.jsx`

- [ ] **Step 1: TransactionFormModal 전체 구조로 교체**

```jsx
// src/components/transactions/TransactionFormModal.jsx
import { useState } from 'react'
import Modal from '../ui/Modal'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function TransactionFormModal({ isOpen, onClose, onSuccess }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [accountId, setAccountId] = useState(null)
  const [date, setDate] = useState(getToday)
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState(null)

  const canSubmit = amount && Number(amount) > 0 && categoryId

  function handleClose() {
    setType('expense')
    setAmount('')
    setCategoryId(null)
    setAccountId(null)
    setDate(getToday())
    setNote('')
    setFormError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!canSubmit) return
    // Task 8에서 저장 로직 연결
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-[15px] font-semibold text-gray-900">새 거래 추가</h2>
        <button
          onClick={handleClose}
          aria-label="닫기"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* 에러 — Task 8에서 채움 */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-[13px] text-red-700">
            {formError}
          </div>
        )}

        {/* Task 4에서 채움: 토글, 금액, 날짜, 메모 */}
        <div className="h-40 rounded-lg bg-gray-50 flex items-center justify-center text-[12px] text-gray-400">
          폼 필드 (Task 4 구현 예정)
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
        <button className="btn btn-ghost" onClick={handleClose}>취소</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          저장
        </button>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 2: 브라우저 확인**

Header, 빈 body placeholder, Footer 버튼 레이아웃 정상 표시 확인.
"저장" 버튼이 비활성(disabled, 흐린 상태) 확인.

- [ ] **Step 3: 커밋 없음** — Task 4와 합산 커밋

---

## Task 4: 지출/수입 토글 + 금액·날짜·메모 입력 UI

**Files:**
- Modify: `src/components/transactions/TransactionFormModal.jsx`

- [ ] **Step 1: Body placeholder를 실제 폼 필드로 교체**

`TransactionFormModal.jsx`의 body 안 `{/* Task 4에서 채움 */}` 블록을 아래로 교체:

```jsx
        {/* 지출 / 수입 토글 */}
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-100">
          <button
            data-type-btn="expense"
            onClick={() => { setType('expense'); setCategoryId(null) }}
            className={`flex-1 h-8 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer
              ${type === 'expense'
                ? 'bg-red-50 text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            지출
          </button>
          <button
            data-type-btn="income"
            onClick={() => { setType('income'); setCategoryId(null) }}
            className={`flex-1 h-8 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer
              ${type === 'income'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            수입
          </button>
        </div>

        {/* 금액 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">금액</label>
          <div className={`flex items-center gap-2 border rounded-lg px-3 h-12 transition-colors duration-150
            ${type === 'expense'
              ? 'border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
              : 'border-blue-200 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'}`}
          >
            <input
              data-testid="amount-input"
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
              onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className={`flex-1 min-w-0 bg-transparent outline-none text-right font-mono text-[24px] font-bold
                placeholder:text-gray-300
                ${type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}
            />
            <span className="text-[13px] text-gray-400 shrink-0">원</span>
          </div>
        </div>

        {/* 카테고리 — Task 7에서 연결 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">카테고리</label>
          <div
            data-testid="category-grid"
            className="grid grid-cols-4 gap-2 bg-gray-50 rounded-lg p-3 text-center text-[12px] text-gray-400"
          >
            카테고리 로딩 예정 (Task 7)
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">날짜</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="field w-full cursor-pointer"
          />
        </div>

        {/* 계좌 — Task 7에서 연결 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">계좌 (선택)</label>
          <div className="text-[12px] text-gray-400 bg-gray-50 rounded-lg p-3">
            계좌 로딩 예정 (Task 7)
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">메모 (선택)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="간단한 메모를 입력하세요"
            className="field w-full"
          />
        </div>
```

- [ ] **Step 2: 브라우저에서 직접 확인**

- 지출 탭 클릭 → 빨간 배경/글자
- 수입 탭 클릭 → 파란 배경/글자
- 금액 입력 → 타이핑 시 쉼표 포맷팅 (예: `10000` → `10,000`)
- 날짜 클릭 → 달력 picker 열림, 기본값 오늘
- 메모 입력 → 텍스트 입력 동작

- [ ] **Step 3: Playwright 폼 UI 테스트 실행**

```bash
$env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"; npx playwright test --grep "토글|금액|색상" --reporter=line
```

Expected: 지출/수입 토글 색상 테스트 PASS, 금액 포맷팅 테스트 PASS

- [ ] **Step 4: 커밋**

```bash
git add src/components/transactions/TransactionFormModal.jsx
git commit -m "feat: add transaction form fields UI"
```

---

## Task 5: useAccounts.js 훅 작성

**Files:**
- Create: `src/hooks/useAccounts.js`

- [ ] **Step 1: useAccounts.js 생성**

```js
// src/hooks/useAccounts.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('name')

      setLoading(false)

      if (error) {
        setError('계좌를 불러오지 못했습니다.')
        return
      }

      setAccounts(data)
    }

    fetch()
  }, [])

  return { accounts, loading, error }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/hooks/useAccounts.js
git commit -m "feat: add useAccounts hook"
```

---

## Task 6: 카테고리 그리드 + 계좌 선택 연결

**Files:**
- Modify: `src/components/transactions/TransactionFormModal.jsx`

- [ ] **Step 1: import 추가**

`TransactionFormModal.jsx` 상단 import 블록에 추가:

```jsx
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'
```

- [ ] **Step 2: 훅 호출 추가**

`export default function TransactionFormModal` 안, 기존 useState 선언 아래에 추가:

```jsx
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const filteredCategories = categories.filter(
    c => c.type === (type === 'expense' ? 'expense' : 'income')
  )
```

- [ ] **Step 3: 카테고리 placeholder를 실제 그리드로 교체**

`data-testid="category-grid"` div를 아래로 교체:

```jsx
          <div data-testid="category-grid" className="grid grid-cols-4 gap-2">
            {filteredCategories.length === 0 ? (
              <div className="col-span-4 py-6 text-center text-[12px] text-gray-400">
                카테고리를 불러오는 중...
              </div>
            ) : (
              filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border
                    transition-all duration-150 cursor-pointer min-h-[60px]
                    ${categoryId === cat.id
                      ? 'bg-indigo-50 border-indigo-500 border-[1.5px]'
                      : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="text-[20px] leading-none">{cat.icon}</span>
                  <span className={`text-[11px] font-medium leading-tight text-center line-clamp-1
                    ${categoryId === cat.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                </button>
              ))
            )}
          </div>
```

- [ ] **Step 4: 계좌 placeholder를 실제 pill로 교체**

계좌 `div` 안의 "계좌 로딩 예정" 텍스트를 아래로 교체:

```jsx
          <div className="flex flex-wrap gap-2">
            {accounts.length === 0 ? (
              <span className="text-[12px] text-gray-400">등록된 계좌가 없습니다</span>
            ) : (
              accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setAccountId(accountId === acc.id ? null : acc.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                    text-[12px] font-medium transition-all duration-150 cursor-pointer
                    ${accountId === acc.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span
                    className="w-2 h-2 rounded-[2px] shrink-0"
                    style={{ backgroundColor: acc.color ?? '#6b7280' }}
                  />
                  {acc.name}
                </button>
              ))
            )}
          </div>
```

- [ ] **Step 5: 브라우저 확인**

- 지출 탭 → 지출 카테고리 그리드 표시
- 수입 탭 → 수입 카테고리 그리드로 교체 (이전 선택 초기화)
- 카테고리 클릭 → 인디고 테두리
- 계좌 등록 있으면 pill 표시, 없으면 안내 문구

- [ ] **Step 6: Playwright 카테고리 테스트 실행**

```bash
$env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"; npx playwright test --grep "카테고리" --reporter=line
```

Expected: 카테고리 그리드 로딩, 선택 테두리 테스트 PASS

- [ ] **Step 7: 커밋**

```bash
git add src/components/transactions/TransactionFormModal.jsx
git commit -m "feat: connect category grid and account selector to transaction form"
```

---

## Task 7: 저장 로직 연결 (useAuth + useCreateTransaction)

**Files:**
- Modify: `src/components/transactions/TransactionFormModal.jsx`

- [ ] **Step 1: import 추가**

파일 상단에 추가:

```jsx
import { useAuth } from '../../contexts/AuthContext'
import { useCreateTransaction } from '../../hooks/useCreateTransaction'
```

- [ ] **Step 2: 훅 호출 추가**

기존 `useCategories`, `useAccounts` 아래에 추가:

```jsx
  const { session } = useAuth()
  const { createTransaction, loading } = useCreateTransaction()
```

- [ ] **Step 3: handleSubmit 완성**

기존 `async function handleSubmit()` 함수를 아래로 교체:

```jsx
  async function handleSubmit() {
    if (!canSubmit || loading) return
    setFormError(null)

    const result = await createTransaction({
      userId: session?.user?.id,
      categoryId,
      accountId: accountId ?? null,
      amount: Number(amount),
      type,
      note: note.trim() || null,
      date,
    })

    if (!result) {
      setFormError('거래를 저장하지 못했습니다. 다시 시도해 주세요.')
      return
    }

    onSuccess?.(result)
    handleClose()
  }
```

- [ ] **Step 4: 저장 버튼에 로딩 상태 추가**

Footer의 저장 버튼을 아래로 교체:

```jsx
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              저장 중...
            </span>
          ) : '저장'}
        </button>
```

- [ ] **Step 5: 브라우저 직접 테스트 (실제 저장)**

1. 개발 서버 실행: `npm run dev`
2. 로그인 후 "새 거래 추가" 클릭
3. 지출 선택, 금액 입력 `10000`, 카테고리 선택
4. "저장" 클릭
5. 저장 중 스피너 표시 확인
6. 모달 닫힘 확인

- [ ] **Step 6: Playwright 저장 테스트 실행**

```bash
$env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"; npx playwright test --grep "저장|비활성" --reporter=line
```

Expected: 필수항목 미입력 비활성 테스트 PASS, 거래 저장 성공 → 모달 닫힘 PASS

- [ ] **Step 7: 커밋**

```bash
git add src/components/transactions/TransactionFormModal.jsx
git commit -m "feat: connect save logic to transaction form modal"
```

---

## Task 8: Supabase 데이터 저장 검증

**Files:**
- 없음 (MCP 도구로 DB 직접 조회)

- [ ] **Step 1: Playwright 전체 E2E 실행**

```bash
$env:TEST_EMAIL="your@email.com"; $env:TEST_PASSWORD="yourpassword"; npx playwright test --reporter=list
```

Expected: 전체 테스트 PASS. 실패 항목 있으면 오류 메시지 확인 후 수정.

- [ ] **Step 2: Supabase에서 저장된 데이터 확인**

MCP 도구 `mcp__supabase__execute_sql`로 아래 쿼리 실행:

```sql
SELECT
  t.id,
  t.type,
  t.amount,
  t.date,
  t.note,
  t.created_at,
  c.name AS category_name,
  a.name AS account_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN accounts a ON t.account_id = a.id
ORDER BY t.created_at DESC
LIMIT 5;
```

Expected: 방금 저장한 거래 row가 최상단에 표시됨

- [ ] **Step 3: 최종 커밋 (테스트 파일 포함)**

```bash
git add tests/
git commit -m "test: verify transaction form E2E and Supabase data integrity"
```

---

## 전체 커밋 순서 요약

```
test: add Playwright E2E setup and transaction form test spec
feat: add base Modal component and transaction modal trigger
feat: add transaction form fields UI
feat: add useAccounts hook
feat: connect category grid and account selector to transaction form
feat: connect save logic to transaction form modal
test: verify transaction form E2E and Supabase data integrity
```

최종 phase.md 기준 커밋: `feat: add transaction create form modal` (브랜치 병합 시 squash 옵션)

---

## ui-ux-pro-max 최종 체크리스트

- [ ] 모든 클릭 가능 요소에 `cursor-pointer`
- [ ] 호버 상태 `transition-colors duration-150`
- [ ] 카테고리 셀 `min-h-[60px]` (touch target ≥44px)
- [ ] 닫기 버튼 `w-8 h-8` = 32px (Tailwind 기준, 실제 hit area 충분)
- [ ] `aria-label="닫기"` 명시
- [ ] 금액 `font-mono` + `tabular-nums` 효과 (number-tabular 규칙)
- [ ] 에러 메시지 폼 상단 인라인 (error-placement 규칙)
- [ ] 저장 버튼 loading 중 disabled (loading-buttons 규칙)
- [ ] Escape 닫기 (keyboard-nav 규칙)
- [ ] 모달 닫힐 때 폼 상태 초기화 (sheet-dismiss-confirm 규칙 유사)
