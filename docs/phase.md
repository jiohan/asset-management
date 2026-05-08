# Monimo — 전체 개발 순서

## Phase 1 — 프로젝트 초기 설정
React + Vite 생성, Tailwind/Router/Recharts 설치, GitHub 저장소 연결, Vercel 배포 연결.
→ `npm run dev`로 빈 화면이 뜨면 완료.

## Phase 2 — Supabase 설정
Supabase 프로젝트 생성, 테이블 6개 생성(profiles/accounts/categories/transactions/transfers/budgets), RLS 정책 적용, 프리셋 카테고리 데이터 삽입.
→ Supabase 대시보드에서 테이블과 데이터 확인되면 완료.

## Phase 3 — 인증 구현
회원가입/로그인/로그아웃 화면, 로그인 여부에 따른 페이지 접근 보호.
→ 이메일로 가입 후 로그인/로그아웃 동작하면 완료.

## Phase 4 — 기본 레이아웃
Sidebar, Header, PageLayout 컴포넌트 + React Router 라우팅 설정.
→ 각 페이지로 이동이 되면 완료.

## Phase 5 — 거래 입력/목록 (핵심)
거래 추가 폼(지출·수입), 거래 목록, 수정·삭제. 이체 입력 포함.
→ 거래를 입력하고 목록에서 확인·삭제되면 완료.

## Phase 6 — 계좌 관리
계좌 추가·편집·삭제, 계좌별 잔액 표시.
→ 계좌 등록 후 거래 필터링 동작하면 완료.

## Phase 7 — 예산 설정
월 전체 예산 + 카테고리별 예산 입력, 초과 여부 표시.
→ 예산 저장 후 대시보드에 반영되면 완료.

## Phase 8 — 대시보드
월별 요약 카드, 도넛 차트(Recharts), 최근 거래 목록.
→ 차트와 숫자가 실제 데이터와 일치하면 완료.

## Phase 9 — 마무리 & 배포
UI 다듬기, 모바일 반응형 확인, Vercel 프로덕션 배포.
→ 실제 URL로 접속되고 전 기능 동작하면 완료.
