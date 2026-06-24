# Phase 7 빌드 로그 — 예산 관리

> 작성일: 2026-06-23  
> 담당: Claude (Task 7-1 ~ 7-6)  
> 브랜치: feature/phase7-budget

---

## 1. 구현 범위

Phase 7은 월별 예산 설정·조회·수정·삭제 기능 전체를 포함한다.

- **DB 마이그레이션**: `phase7_budgets_unique_indexes` (2026-06-23)
- **훅 4개**: `useMonthBudgetData`, `useUpsertBudget`, `useDeleteCategoryBudget`, `useMonthExpenseByCategory`
- **페이지**: `BudgetPage.jsx` (월 네비, carry-over 배너, 총 예산 카드, 카테고리 목록, 기타 행)
- **모달 2개**: `TotalBudgetModal.jsx`, `CategoryBudgetModal.jsx` (`src/components/budget/`)

---

## 2. DB 마이그레이션 결정: Partial Unique Index vs UNIQUE 제약

### 문제

`budgets` 테이블은 두 종류의 행을 동일한 테이블에 저장한다.

| 행 종류 | `category_id` | 고유성 조건 |
|---|---|---|
| 전체 예산 | `NULL` | `(user_id, month)` 쌍이 유일해야 함 |
| 카테고리 예산 | UUID | `(user_id, category_id, month)` 쌍이 유일해야 함 |

### 왜 표준 UNIQUE 제약을 쓰지 않는가

표준 SQL에서 `UNIQUE(user_id, category_id, month)`를 선언하면, `category_id IS NULL`인 행은 NULL 비교 규칙(NULL ≠ NULL)에 의해 중복 삽입이 **허용된다**. 즉 한 사용자·월에 전체 예산 행이 여러 개 생길 수 있다.

### 채택: Partial Unique Index 2개

```sql
-- 전체 예산: category_id가 NULL인 행만 대상
CREATE UNIQUE INDEX budgets_total_unique
  ON budgets (user_id, month)
  WHERE category_id IS NULL;

-- 카테고리 예산: category_id가 NOT NULL인 행만 대상
CREATE UNIQUE INDEX budgets_category_unique
  ON budgets (user_id, category_id, month)
  WHERE category_id IS NOT NULL;
```

PostgreSQL의 Partial Index는 `WHERE` 조건에 맞는 행에만 고유성을 강제한다. NULL 비교 문제를 우회하면서 두 규칙을 각각 정확하게 표현할 수 있다.

### 채택하지 않은 대안

- **별도 테이블 분리** (`total_budgets`, `category_budgets`): 관계 더 명확하지만 조회·뮤테이션 코드가 두 배 복잡해짐. 현재 규모에서 불필요한 오버헤드.
- **`category_id = '00000000-...'` 센티널 UUID**: NULL을 피하려 가짜 UUID 사용 — 데이터 무결성 오염, 카테고리 조인 시 오동작 위험.

---

## 3. 훅 설계 결정

### 3-1. `useMonthBudgetData` — carry-over 로직 & id:null 센티널

**문제**: 새 달로 이동하면 DB에 해당 월 데이터가 없다. 완전히 빈 화면보다 이전 달 예산을 미리 채워두면 UX가 부드럽다.

**구현**: 해당 월 데이터가 0건이면 전 달을 fallback 조회한다. 이때 `shapeBudgets(prevData, nullifyId: true)`를 호출해 carry-over 행의 `id`를 `null`로 치환한다.

**id:null 센티널의 역할**  
`CategoryBudgetModal`은 edit 모드에서 `budgetEntry.id != null`일 때만 삭제 버튼을 렌더링한다. carry-over 행은 DB에 실제로 존재하지 않으므로 삭제 버튼을 노출하면 안 된다. id를 null로 두면 이 조건이 자연스럽게 삭제 버튼을 숨긴다.

**carry-over 저장 플로**: 사용자가 carry-over 상태에서 예산을 저장하면 `upsertBudget`이 해당 월로 신규 삽입한다. 이후 `triggerRefresh()`로 재조회하면 이번 달 데이터가 존재하므로 `isCarriedOver`가 `false`로 바뀌고 배너가 사라진다.

### 3-2. `useUpsertBudget` — 수동 select-then-upsert

**문제**: Supabase JS의 `.upsert()` + `onConflict`는 NULL 컬럼 충돌 조건을 안정적으로 지원하지 않는다. `category_id IS NULL`인 충돌을 `onConflict: 'category_id'`로 표현할 수 없다.

**구현**: 수동으로 `maybeSingle()` 조회 후 존재하면 `UPDATE`, 없으면 `INSERT`한다. `category_id`가 null/undefined인 경우 `.is('category_id', null)` 필터를 명시적으로 사용한다.

### 3-3. `useMonthExpenseByCategory` — Map 자료구조

카테고리별 지출 합산을 `Map<categoryId, amount>`로 반환한다. 배열 대신 Map을 사용하는 이유:
- `CategoryBudgetRow`에서 `expenseByCategory.get(budget.categoryId) ?? 0` 한 줄로 O(1) 조회
- `기타` 행의 `otherExpense` 계산 시 budgetedCategoryIds(Set)와 Map.entries() 순회가 간결

---

## 4. 모달 구조 결정

### 별도 파일 (`src/components/budget/`) vs BudgetPage 인라인

**채택: 별도 파일**

- `TotalBudgetModal`과 `CategoryBudgetModal`은 각각 독립적인 폼 상태(amount, selectedCategoryId, submitError), 비동기 훅(useUpsertBudget, useDeleteCategoryBudget), useEffect 로직을 갖는다.
- BudgetPage 내부에 인라인으로 두면 파일이 400줄 이상으로 불어나고 두 모달의 상태가 BudgetPage의 로컬 state와 혼재된다.
- `src/components/budget/` 하위 폴더는 코딩 컨벤션(도메인별 하위 폴더)과 일치한다.

**채택하지 않은 대안**: 하나의 `BudgetModal` 컴포넌트에 mode prop으로 분기 — 두 모달의 필드 구성이 달라 if/else가 많아지고 가독성이 떨어짐.

---

## 5. 엣지 케이스 처리

| 케이스 | 처리 방식 |
|---|---|
| 해당 월 데이터 없음 + 전 달도 없음 | `totalBudget=0, categoryBudgets=[], isCarriedOver=false` → 빈 상태 UI |
| 전체 예산이 0인 상태 | `OtherBudgetRow`가 `totalBudget === 0`일 때 `null` 반환 → 기타 행 숨김 |
| 카테고리 예산 합계 > 전체 예산 | `otherBudget < 0` → 기타 행 bg-red-50 + 경고 문구 표시, progress bar 숨김 |
| carry-over 행 편집 시 삭제 버튼 | `budgetEntry.id != null` 조건 → carry-over 행(id=null)에서 삭제 버튼 렌더링 안 함 |
| 카테고리 추가 모달 dropdown | 이미 예산이 설정된 카테고리는 `budgetedCategoryIds(Set)` 필터로 제외 |
| 로딩 중 레이아웃 | animate-pulse 스켈레톤으로 CLS 방지 |
| Supabase 오류 | error state → 빨간 에러 배너 렌더링 |

---

## 6. LedgerRefreshContext 연동

`handleMutationComplete`가 3가지 작업을 한 번에 처리한다:

```js
function handleMutationComplete() {
  setShowTotalModal(false)       // 총 예산 모달 닫기
  setEditingCategoryBudget(null) // 카테고리 모달 닫기
  triggerRefresh()               // refreshKey 증가 → 양쪽 훅 재조회
}
```

두 모달 모두 `onSaved={handleMutationComplete}`를 받고, `CategoryBudgetModal`은 추가로 `onDeleted={handleMutationComplete}`를 받는다. 저장·삭제 어느 경로에서도 동일한 함수가 호출되어 일관성을 보장한다.

---

## 7. Playwright 검증 결과

| 테스트 | 결과 | 비고 |
|---|---|---|
| A. 월 네비게이션 데이터 새로고침 | PASS | 7월 이동 시 carry-over 데이터 표시, 오늘 버튼으로 6월 복귀 정상 |
| B. 빈 달 엣지 케이스 (2025년 12월) | PASS | 빈 상태 UI, 기타 행 숨김, JS 에러 없음 |
| C. 카테고리 합계 > 전체 예산 (오버플로우) | PASS | 기타 행 bg-red-50 + "카테고리 예산 합계가 전체 예산을 초과했습니다" 표시 |
| C. 클린업 (쇼핑 예산 삭제) | PASS | 삭제 버튼 동작, 모달 닫힘, 기타 행 300,000원으로 복구 |
| D. Carry-over 배너 | PASS | 7월(데이터 없는 미래 달) 이동 시 amber 배너 표시 |
| JS 에러 (현재 세션) | 0건 | HMR 초기 재시도 오류는 dev 서버 기동 시 발생한 일시적 오류, 현재 세션 기준 0건 |

**미검증 항목**: Ledger→Budget 크로스 페이지 새로고침 (거래 추가 후 예산 페이지 반영 여부). `triggerRefresh()`가 LedgerRefreshContext를 통해 양쪽 훅 모두 구독하므로 구조적으로는 동작하나, 이번 세션에서 직접 확인하지 않았다.

---

## 8. UI/UX 시각적 검토 (ui-ux-pro-max + frontend-design 스킬)

**일관성 평가**: 전체적으로 Monimo 디자인 시스템(인디고 주 컬러, 그레이 스케일, Pretendard/JetBrains Mono 폰트)과 일관된다.

**긍정적 요소**:
- 게이지 바 색상 3단계(indigo → orange → red)가 예산 소진율을 직관적으로 전달
- 빈 상태, 로딩 스켈레톤, 에러 배너 모두 구현됨
- carry-over 배너의 amber 색상이 정보성 경고 톤과 맞음

**마이너 폴리시 항목** (Phase 8 이전 개선 권고):
- `OtherBudgetRow`의 `➕` 이모지가 구조적 아이콘으로 사용됨 — ui-ux-pro-max `no-emoji-icons` 규칙 위반. SVG 아이콘으로 교체 권고 (단, CategoryBudgetRow의 카테고리 이모지는 사용자 데이터 표시이므로 허용)
- 기타 행에 cursor:pointer가 없음 (클릭 불가 행이므로 의도적이나, 사용자가 클릭을 시도할 가능성 있음)

**채택하지 않은 스타일**: dark mode OLED — ui-ux-pro-max 추천이나 Monimo는 라이트 테마를 확정으로 채택. 현재 라이트 테마가 타겟 사용자(가계부 초보자)에게 더 접근하기 쉬움.
