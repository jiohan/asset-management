# Monimo — 아키텍처 명세

## 인증 흐름

- **MVP**: 이메일 + 비밀번호 (Supabase Auth)
- **v2**: Google OAuth 추가 예정
- 로그인 후 Supabase가 JWT 토큰 발급 → 이후 모든 요청에 자동 포함
- RLS(Row Level Security) 적용: 사용자는 자신의 `user_id`와 일치하는 데이터만 접근 가능

## Supabase 테이블 구조

### `profiles`
사용자 기본 설정. Supabase Auth 회원가입 시 트리거로 자동 생성.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | auth.users.id 참조 (PK) |
| display_name | text | 사용자 표시 이름 |
| monthly_budget | integer | 월 전체 예산 (원 단위, 기본값 0) |

---

### `accounts`
사용자의 카드/통장 계좌 목록.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | auth.users.id 참조 |
| name | text | 계좌 이름 (예: 카카오뱅크 체크) |
| type | text | checking \| credit_card \| savings \| cash |
| color | text | UI 구분용 hex 색상 (예: #6366f1) |
| initial_balance | integer | 계좌 등록 시 입력한 초기 잔액 (기본값 0) — Phase 6 마이그레이션 추가 |
| is_active | boolean | 소프트 딜리트 플래그 (기본값 true) — Phase 6 마이그레이션 추가 |

> **계좌 잔액**: 별도 balance 컬럼 없음. `initial_balance + 수입 합계 − 지출 합계 + 이체 입금 − 이체 출금`으로 계산 (`useAccountsWithBalance` 훅).
> **계좌 삭제**: hard delete 아님. `is_active = false` 소프트 딜리트. 연결 거래·이체 데이터는 보존됨.

---

### `categories`
지출/수입 카테고리. 프리셋과 커스텀을 같은 테이블에서 관리.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid \| NULL | NULL = 전체 사용자 공유 프리셋 |
| name | text | 카테고리 이름 |
| icon | text | 이모지 |
| type | text | income \| expense |

**기본 프리셋 (user_id = NULL):**

| 아이콘 | 이름 | 타입 |
|--------|------|------|
| 🍚 | 식비 | expense |
| 🚌 | 교통 | expense |
| 🛍️ | 쇼핑 | expense |
| 🏠 | 주거·공과금 | expense |
| 💊 | 의료·건강 | expense |
| 🎬 | 문화·여가 | expense |
| ☕ | 카페·간식 | expense |
| 📚 | 교육 | expense |
| 💰 | 저축·투자 | expense |
| ➕ | 기타 | expense |
| 💵 | 월급 | income |
| 💼 | 부수입 | income |
| ➕ | 기타수입 | income |

---

### `transactions`
수입/지출 거래 내역.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | auth.users.id 참조 |
| account_id | uuid \| NULL | accounts.id 참조 |
| category_id | uuid | categories.id 참조 |
| amount | integer | 금액 (원 단위 정수, 양수) |
| type | text | income \| expense |
| note | text \| NULL | 메모 (선택) |
| date | date | YYYY-MM-DD |
| created_at | timestamptz | 자동 생성 |

---

### `transfers`
계좌 간 이체. 수입/지출 계산에서 완전 분리.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | auth.users.id 참조 |
| from_account_id | uuid | 출금 계좌 (accounts.id) |
| to_account_id | uuid | 입금 계좌 (accounts.id) |
| amount | integer | 이체 금액 (원 단위) |
| note | text \| NULL | 메모 (선택) |
| date | date | YYYY-MM-DD |
| created_at | timestamptz | 자동 생성 |

---

### `budgets`
월별 예산 설정.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | auth.users.id 참조 |
| category_id | uuid \| NULL | NULL = 전체 예산 |
| amount | integer | 예산 금액 (원 단위) |
| month | text | YYYY-MM 형식 (예: 2026-05) |

## 테이블 관계 요약

```
auth.users
    │
    ├── profiles (1:1)
    ├── accounts (1:N)
    ├── categories (1:N, user_id가 있는 커스텀만)
    ├── transactions (1:N)
    │       └── account_id → accounts
    │       └── category_id → categories
    ├── transfers (1:N)
    │       ├── from_account_id → accounts
    │       └── to_account_id → accounts
    └── budgets (1:N)
            └── category_id → categories
```

## RLS 정책 원칙

모든 테이블에 아래 정책 적용:
- `SELECT`: `user_id = auth.uid()`
- `INSERT`: `user_id = auth.uid()`
- `UPDATE`: `user_id = auth.uid()`
- `DELETE`: `user_id = auth.uid()`

categories 프리셋(user_id = NULL)은 모든 사용자에게 SELECT 허용.
