# Phase 6 빌드 로그 — 계좌 관리

> 작성일: 2026-06-18  
> 목적: Phase 6 구현 과정에서 내린 결정과 선택한 구조를 섹션별로 요약

---

## 6-1. DB 스키마 — accounts 테이블

`accounts` 테이블에 `is_active BOOLEAN DEFAULT true` 컬럼을 추가해 소프트 삭제 방식 채택.  
`initial_balance`는 신용카드에서 음수(-) 저장; 실제 잔액 = initial_balance + 수입 − 지출 + 이체입금 − 이체출금.

## 6-2. 잔액 계산 훅 — useAccountsWithBalance

accounts + transactions + transfers를 병렬 fetch해서 클라이언트에서 잔액을 계산하는 단일 훅으로 설계.  
신용카드는 initial_balance가 음수이므로 공식 그대로 적용하면 자동으로 부채가 된다.

## 6-3. 계좌 CRUD 훅 — useCreateAccount / useUpdateAccount / useDeleteAccount

훅 파일을 역할별로 분리(create / update / delete), CLAUDE.md 컨벤션(쿼리 로직은 hooks/)을 준수.  
deleteAccount는 `update({ is_active: false })`로 소프트 삭제 — 연결된 거래·이체 데이터를 보존.

## 6-4. 계좌 추가/수정 모달 — AccountFormModal

`account` prop 유무로 생성/수정 모드를 분기(`isEdit = !!account`), 단일 컴포넌트가 두 역할 담당.  
신용카드는 입력값을 음수로 변환(`-rawBalance`)하고, 수정 시 `Math.abs`로 표시해 사용자 혼란 방지.

## 6-5. 계좌 목록 페이지 — AccountsPage

순자산 카드(총 자산 / 총 부채 / 순자산) + 계좌 그리드로 구성; AccountCard에 group-hover 패턴으로 편집·삭제 버튼 표시.  
삭제 전에 `transactions` + `transfers` 건수를 확인해 연결 거래가 있으면 삭제를 차단(유령 계좌 방지).

## 6-6. 계좌 상세 패널 — AccountDetailPanel + useAccountDetail

TransactionDetailPanel과 동일한 우측 슬라이드 패널 패턴; 월별 네비게이션으로 월 단위 조회.  
거래(transactions)와 이체(transfers)를 날짜 역순으로 합친 타임라인에서 이체는 방향(`→` 출금 / `←` 입금)을 표시.

## 6-7. 글로벌 리프레시 연동 — LedgerRefreshContext

AccountsPage가 `globalRefreshKey`를 구독해, 거래 추가/수정/삭제 시 계좌 잔액이 자동 갱신.  
localRefreshKey(계좌 자체 변경) + globalRefreshKey(거래 변경)를 합산해 의존성을 단일 숫자로 표현.

---

## 검증 완료 항목 (Playwright)

| 항목 | 결과 |
|------|------|
| 계좌 추가 (입출금 / 신용카드) | ✅ |
| 계좌 수정 — 이름·유형·초기잔액 변경 | ✅ |
| 계좌 삭제 — 빈 계좌 | ✅ |
| 계좌 삭제 — 거래 연결 시 차단 | ✅ |
| 잔액 = 초기잔액 + 수입 − 지출 | ✅ |
| 이체 → 송신·수신 계좌 동시 갱신 | ✅ |
| 상세 패널 타임라인 — 거래·이체 혼합 표시 | ✅ |
| 거래 추가 후 계좌 잔액 자동 갱신 | ✅ |
| 순자산 = 총 자산 + 총 부채 (신용카드 음수 반영) | ✅ |
