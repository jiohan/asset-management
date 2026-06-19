# Monimo

엑셀 없이, 수식 없이 — 하루 5분으로 쓰는 개인 웹 가계부.

## 프로젝트 개요

- **앱 이름**: Monimo
- **타겟**: 엑셀이 귀찮거나 어려운 사람, 가계부를 간편하게 시작하고 싶은 사람
- **아키텍처**: 멀티유저 (Supabase Auth 기반, 사용자별 데이터 격리)

## 기술 스택

| 역할       | 기술                                                         |
| ---------- | ------------------------------------------------------------ |
| 프론트엔드 | React 18 + Vite 6, Tailwind CSS 4, Recharts, React Router 6  |
| 백엔드/DB  | Supabase (PostgreSQL + Auth + RLS)                           |
| 폰트       | Pretendard Variable (한글), JetBrains Mono (코드) — CDN 로드 |
| 배포       | Vercel (프론트) + GitHub (소스 관리)                         |

## 개발 명령어

```bash
npm run dev      # 개발 서버 (localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과물 미리보기
```

## 폴더 구조

```
src/
├── App.jsx              # 라우팅 (BrowserRouter + PrivateRoute)
├── components/
│   ├── ui/              # Modal 등 기본 요소
│   ├── layout/          # AppHeader, AppLayout, AuthLayout, Sidebar
│   ├── accounts/        # AccountDetailPanel, AccountFormModal
│   └── transactions/    # TransactionDetailPanel, TransactionFormModal
├── contexts/            # AuthContext, LedgerRefreshContext
├── pages/               # LandingPage, LoginPage, SignupPage, DashboardPage,
│                        # LedgerPage, BudgetPage, AccountsPage
├── hooks/               # Supabase 쿼리 커스텀 훅 (16개)
├── lib/
│   └── supabase.js      # Supabase 클라이언트
└── utils/               # accountColors.js, accountTypes.js
```

## 라우팅 구조

- 공개: `/` (Landing), `/login`, `/signup`
- 보호: `/dashboard`, `/ledger`, `/budget`, `/accounts` → `PrivateRoute` + `AppLayout`

## DB 스키마 (6 테이블, 모두 RLS 적용)

`profiles` / `accounts` / `categories` / `transactions` / `transfers` / `budgets`

- 계좌 잔액은 계산값 (저장 안 함): `initial_balance + 수입 − 지출 + 이체입금 − 이체출금`
- 계좌 삭제는 소프트 삭제 (`is_active = false`)
- 카테고리 프리셋은 공용 (`user_id = NULL`)

## 코딩 컨벤션

- 컴포넌트/Context: `PascalCase.jsx`
- 훅/유틸: `camelCase.js`
- Supabase 쿼리: 반드시 `hooks/`에 작성 (페이지·컴포넌트에 직접 쓰지 않음)
- 컴포넌트는 도메인별 하위 폴더로 구성 (`accounts/`, `transactions/`, `layout/`, `ui/`)
- 금액 표시: `amount.toLocaleString('ko-KR') + '원'`
- 날짜 표시: `YYYY.MM.DD` 형식

## 주요 문서

- `docs/architecture.md` — DB 스키마 상세
- `docs/features.md` — MVP 기능 명세
- `docs/design-system.md` — UI 색상·컴포넌트 패턴
- `docs/phase.md` — 전체 개발 단계 (Phase 1~9)
- `docs/build-logs/` — Phase별 빌드 로그

## 빌드 로그 규칙

Phase 완료 시 `docs/build-logs/phase{N}-build-log.md` 작성.  
포함: AI 판단 근거, 수행 작업(생성/수정 파일), 채택하지 않은 대안과 이유.

## 금지사항

- 직접 git 사용 금지
