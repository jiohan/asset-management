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
5-1 훅 작성
    → 5-2 거래 추가 폼
      → 5-3 거래 목록 테이블
        → 5-4 월 네비 + 요약 카드
          → 5-5 필터
            → 5-6 수정/삭제
              → 5-7 이체
              Phase 5 — 브랜치 & 커밋 계획
  
  브랜치 전략

  Phase 5 전체를 브랜치 1개로 작업해요. 기존 Phase 4(feature/layout)와 같은 방식이에요.

  main
   └── feature/phase5-ledger   ← 이 브랜치에서 모든 작업

  ---
  커밋 순서 (서브태스크당 1커밋)

  순서: 1
  커밋 메시지: feat: add transaction and category hooks
  작업 내용: useCategories, useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction 5개 훅
  ────────────────────────────────────────
  순서: 2
  커밋 메시지: feat: add transaction create form modal
  작업 내용: 거래 추가 폼 — 금액, 지출/수입 토글, 카테고리, 날짜, 계좌, 메모
  ────────────────────────────────────────
  순서: 3
  커밋 메시지: feat: add ledger transaction list table
  작업 내용: 날짜 그룹별 테이블, 금액 색상
  ────────────────────────────────────────
  순서: 4
  커밋 메시지: feat: add month navigation and summary cards
  작업 내용: < 2026년 5월 > 헤더, 요약 카드 4개
  ────────────────────────────────────────
  순서: 5
  커밋 메시지: feat: add transaction filter toolbar
  작업 내용: 전체/지출/수입/이체 탭, 계좌·카테고리 드롭다운
  ────────────────────────────────────────
  순서: 6
  커밋 메시지: feat: add transaction detail panel
  작업 내용: 행 클릭 → 우측 패널, 수정·삭제
  ────────────────────────────────────────
  순서: 7
  커밋 메시지: feat: add transfer input
  작업 내용: 이체 폼, 목록에 이체 행 표시

## Phase 6 — 계좌 관리
계좌 추가·편집·삭제, 계좌별 잔액 표시, 계좌 상세 뷰.
→ 계좌 등록 후 거래·이체 연동 잔액이 정확하게 반영되면 완료.
6-1 잔액 계산 훅 작성
    → 6-2 계좌 CRUD 훅 추가
      → 6-3 계좌 목록 카드 UI
        → 6-4 계좌 추가 모달
          → 6-5 계좌 편집 · 삭제
            → 6-6 계좌 상세 뷰 (거래·이체 내역)
              → 6-7 전체 연동 마무리

  6-1: 잔액 계산 훅 작성
  useAccountsWithBalance — 계좌 목록 + 각 계좌의 실시간 잔액 계산
  잔액 공식: 수입 합계 − 지출 합계 + 이체 입금 합계 − 이체 출금 합계

  6-2: 계좌 CRUD 훅 추가
  useCreateAccount(이름·타입·색상·초기잔액), useUpdateAccount, useDeleteAccount
  삭제 = 소프트 딜리트(is_active=false). useUpdateAccount는 is_active를 건드리지 않으므로 계좌 복원 기능이 필요해지면 별도 처리 필요.

  6-3: 계좌 목록 카드 UI
  계좌 카드 그리드 (색상 배지·계좌명·타입·잔액)
  전체 순자산 합계 헤더 카드, 잔액 양수(녹색)/음수(빨강) 색상 구분

  6-4: 계좌 추가 모달
  계좌명 입력, 타입 선택(체크카드/신용카드/저축/현금), 색상 팔레트 선택, 초기 잔액 입력
  주의: 계좌 생성 후 거래 폼 드롭다운 자동 갱신을 위해 useAccounts.js에 refreshKey 추가 필요.

  6-5: 계좌 편집 · 삭제
  편집 버튼 → 기존 값 pre-fill 수정 모달
  삭제 버튼 → 확인 다이얼로그, 연결 거래 있으면 삭제 불가 + 경고

  6-6: 계좌 상세 뷰 (거래·이체 내역)
  계좌 카드 클릭 → 우측 슬라이드 패널
  해당 계좌의 수입/지출 목록 + 이체 목록 (출금: → 대상계좌 / 입금: ← 출처계좌)
  월 네비게이션 + 해당 월 수입/지출/이체 요약

  6-7: 전체 연동 마무리
  거래 추가/수정/삭제 → 계좌 잔액 즉시 갱신 (LedgerRefreshContext 활용)
  이체 생성/삭제 → from/to 계좌 잔액 동시 갱신

  Phase 6 — 브랜치 & 커밋 계획

  브랜치: feature/phase6-accounts

  순서: 1
  커밋 메시지: feat: add account balance calculation hook
  작업 내용: useAccountsWithBalance — transactions·transfers 집계 잔액 계산
  ────────────────────────────────────────
  순서: 2
  커밋 메시지: feat: add account CRUD hooks
  작업 내용: useCreateAccount, useUpdateAccount, useDeleteAccount
  ────────────────────────────────────────
  순서: 3
  커밋 메시지: feat: add account card list UI
  작업 내용: 계좌 카드 그리드, 순자산 헤더, 잔액 색상
  ────────────────────────────────────────
  순서: 4
  커밋 메시지: feat: add account create modal
  작업 내용: 이름/타입/색상 입력 폼
  ────────────────────────────────────────
  순서: 5
  커밋 메시지: feat: add account edit and delete
  작업 내용: 편집 모달, 삭제 확인, 연결 거래 차단
  ────────────────────────────────────────
  순서: 6
  커밋 메시지: feat: add account detail panel
  작업 내용: 계좌별 거래·이체 내역, 월 네비, 잔액 요약
  ────────────────────────────────────────
  순서: 7
  커밋 메시지: feat: wire account balance refresh on ledger changes
  작업 내용: LedgerRefreshContext 연동, 거래·이체 변경 시 잔액 갱신

## Phase 7 — 예산 설정
월 전체 예산 + 카테고리별 예산 입력, 초과 여부 표시.
→ 예산 저장 후 대시보드에 반영되면 완료.

## Phase 8 — 대시보드
월별 요약 카드, 도넛 차트(Recharts), 최근 거래 목록.
→ 차트와 숫자가 실제 데이터와 일치하면 완료.

## Phase 9 — 마무리 & 배포
UI 다듬기, 모바일 반응형 확인, Vercel 프로덕션 배포.
→ 실제 URL로 접속되고 전 기능 동작하면 완료.
