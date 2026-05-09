# Phase 4 — 기본 레이아웃 설계

**날짜**: 2026-05-09  
**브랜치**: feature/layout  
**완료 기준**: 로그인 후 4개 경로(/ledger, /dashboard, /budget, /accounts)로 이동이 되고, 각 페이지에서 사이드바·헤더가 정상 표시되면 완료.

---

## 배경

Phase 3에서 인증(로그인/회원가입/로그아웃)을 완성했다. Phase 4에서는 로그인된 사용자가 보게 되는 앱의 뼈대 — 사이드바, 헤더, 페이지 라우팅 — 를 완성한다. 이 단계에서는 DB 데이터를 새로 불러오지 않고, 순수 UI 구조만 구축한다.

---

## 결정 사항

| 항목 | 결정 |
|------|------|
| 컴포넌트 구조 | AppLayout 단일 래퍼 (AuthLayout 패턴과 일관성 유지) |
| 사이드바 계좌 목록 | 빈 상태 표시 (Phase 6에서 Supabase 연결) |
| 로그아웃 | ⚙ 아이콘 클릭 → supabase.auth.signOut() 즉시 실행 |
| 사이드바 Nav 순서 | 대시보드 → 거래 내역 → 예산 → 계좌 |

---

## 파일 구조

```
src/
├── components/layout/
│   ├── AuthLayout.jsx       ← 유지 (변경 없음)
│   ├── AppLayout.jsx        ← 신규: Sidebar + AppHeader + children 조합
│   ├── Sidebar.jsx          ← 신규: 사이드바 전체
│   └── AppHeader.jsx        ← 신규: 상단 헤더
├── pages/
│   ├── LandingPage.jsx      ← 유지
│   ├── LoginPage.jsx        ← 유지
│   ├── SignupPage.jsx       ← 유지
│   ├── DashboardPage.jsx    ← 신규 (빈 껍데기)
│   ├── LedgerPage.jsx       ← 신규 (빈 껍데기)
│   ├── BudgetPage.jsx       ← 신규 (빈 껍데기)
│   └── AccountsPage.jsx     ← 신규 (빈 껍데기)
└── App.jsx                  ← 수정: PlaceholderPage 제거, 실제 페이지 연결
```

---

## 컴포넌트 스펙

### AppLayout.jsx

- `flex min-h-screen` 앱 셸
- `<Sidebar />` + 오른쪽 `flex flex-col` 영역(`<AppHeader />` + `<main>children</main>`)
- App.jsx의 PrivateRoute 안에서 각 페이지를 감싸는 방식으로 사용

### Sidebar.jsx

- 너비: `w-[232px]`, 흰 배경(`bg-white`), 우측 보더(`border-r border-gray-200`)
- **로고 영역** (`h-14`): 인디고 아이콘 박스 + "Monimo" 텍스트 + "v1" 배지
- **새 거래 추가 버튼** (`btn-primary`, `w-full`): Phase 5 전까지 클릭 시 아무 동작 없음
- **Nav 항목 순서**: 대시보드 → 거래 내역 → 예산 → 계좌
  - `NavLink`로 active 클래스 자동 처리 (`isActive` → `nav-item active`)
  - active 스타일: `bg-indigo-50 text-indigo-600 font-semibold`
- **계좌 섹션**: 빈 상태 (`border-dashed`, "계좌가 없어요" 안내 텍스트)
- **하단 유저 프로필**:
  - 아바타: `display_name` 이니셜 또는 이메일 앞 2글자, `bg-indigo-100 text-indigo-700`
  - 닉네임: `session.user.user_metadata.display_name`
  - 이메일: `session.user.email`
  - ⚙ 아이콘 버튼: 클릭 시 `supabase.auth.signOut()` → AuthContext가 session을 null로 → PrivateRoute가 `/login`으로 리디렉션

### AppHeader.jsx

- 높이: `h-14`, 흰 배경, 하단 보더
- Phase 4에서는 페이지 제목(`title` prop)만 표시
- 각 페이지별 세부 헤더 내용(월 네비, 검색 등)은 Phase 5-8에서 추가

### 빈 페이지 컴포넌트 4개

각 페이지는 `AppLayout`을 직접 포함하지 않고, App.jsx에서 `AppLayout`으로 감싸는 구조. 페이지 자체는 `<div>` + 안내 텍스트만 포함.

---

## 라우팅 구조 (App.jsx 수정)

```
/              → LandingPage          (공개)
/login         → LoginPage            (공개)
/signup        → SignupPage           (공개)
/dashboard     → AppLayout > DashboardPage   (PrivateRoute)
/ledger        → AppLayout > LedgerPage      (PrivateRoute)
/budget        → AppLayout > BudgetPage      (PrivateRoute)
/accounts      → AppLayout > AccountsPage    (PrivateRoute)
```

로그인하지 않은 상태에서 `/ledger` 등 접근 시 `/login`으로 리디렉션 (기존 PrivateRoute 유지).

---

## 디자인 레퍼런스

- `docs/design-system.md` — 색상, 타이포그래피, 컴포넌트 스펙
- `Monimo Ledger.html` — 사이드바·헤더 HTML 원본
- CSS 변수: `--indigo: #4f46e5`, `--gray-200: #e5e7eb` 등 (Tailwind 클래스로 대응)

---

## 검증 방법

1. `npm run dev` 실행
2. 로그인 → `/ledger`로 자동 이동 확인
3. 사이드바 Nav 클릭 → 대시보드, 거래 내역, 예산, 계좌 이동 확인
4. active 상태 하이라이트 정상 작동 확인
5. ⚙ 클릭 → 로그아웃 → `/login` 리디렉션 확인
6. 비로그인 상태에서 `/dashboard` 직접 접근 → `/login` 리디렉션 확인
