# Monimo 디자인 시스템

HTML 프로토타입(`Monimo Ledger.html`, `Monimo Dashboard.html`, `Monimo Budget.html`)을 직접 확인하여 정리한 프론트엔드 구현 레퍼런스.

---

## 1. 레이아웃 구조

```
┌────────────────────────────────────────────────────────────┐
│  Sidebar (232px, fixed)   │  Main (flex-1)                 │
│                           │  ┌─ Header (56px) ───────────┐ │
│  - 로고                    │  │  월 네비 + 툴바             │ │
│  - 새 거래 추가 버튼         │  └───────────────────────────┘ │
│  - Nav 링크                │  ┌─ Page Content (스크롤) ───┐ │
│  - 계좌 목록                │  │  p-6 패딩                  │ │
│  - 유저 프로필              │  └───────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

- **앱 셸**: `display:flex; min-height:100vh`
- **사이드바**: `width:232px; flex-shrink:0; background:#fff; border-right:1px solid #e5e7eb`
- **메인**: `flex:1; min-width:0; display:flex; flex-direction:column`
- 페이지 패딩: `p-6` (24px 사방)
- 카드 간격: `gap-3` (12px) 또는 `space-y-5` (20px)

---

## 2. 색상 팔레트

### 브랜드 / 주요 컬러
| CSS 변수 | 값 | 용도 |
|---|---|---|
| `--indigo` | `#4f46e5` | 주요 버튼, 선택 상태, 활성 nav, 인풋 포커스 |
| `--indigo-700` | `#4338ca` | 인디고 호버 상태 |
| `--indigo-50` | `#eef2ff` | 인디고 배경 틴트 (선택 행, 활성 nav bg) |

### 그레이 스케일
| 변수 | 값 | 주요 용도 |
|---|---|---|
| `--gray-50` | `#f9fafb` | 앱 전체 배경, 테이블 헤더 bg |
| `--gray-100` | `#f3f4f6` | 비활성 배경, 빈 progress bar, seg control bg |
| `--gray-200` | `#e5e7eb` | 보더 (카드, 셀, 인풋) |
| `--gray-400` | `#9ca3af` | 보조 아이콘, placeholder |
| `--gray-500` | `#6b7280` | 보조 텍스트, 레이블, 이체 금액 |
| `--gray-700` | `#374151` | 일반 텍스트, nav 기본 색 |
| `--gray-900` | `#111827` | 주요 텍스트, 타이틀 |

### 시맨틱 컬러
| 변수 | 값 | 용도 |
|---|---|---|
| `--red-500` | `#ef4444` | 지출 금액, 예산 초과 progress bar |
| `--red-600` | `#dc2626` | 위험 액션 버튼 |
| `--blue-500` | `#3b82f6` | 수입 금액 |
| `--green-500` | `#22c55e` | 저축·목표 달성·정상 상태 |
| `--amber-500` | `#f59e0b` | 경고·페이스 초과 |

### 카테고리 색상 (progress bar, 도넛 차트)
| 카테고리 | 색상 |
|---|---|
| 식비 | `#6366f1` |
| 주거·공과금 | `#f59e0b` |
| 쇼핑 | `#ef4444` |
| 의료·건강 | `#3b82f6` |
| 문화·여가 | `#10b981` |
| 카페·간식 | `#8b5cf6` |
| 저축·투자 | `#22c55e` |
| 교육 | `#10b981` |
| 교통 | `#6b7280` |

### 계좌 색상
| 계좌 | 색상 |
|---|---|
| 카카오뱅크 체크 | `#6366f1` |
| 신한 신용카드 | `#f59e0b` |
| 토스뱅크 적금 | `#10b981` |
| 현금 지갑 | `#6b7280` |

---

## 3. 타이포그래피

```css
/* 주 폰트 */
font-family: 'Pretendard', 'Inter', system-ui, sans-serif;
-webkit-font-smoothing: antialiased;

/* 숫자·금액 전용 (등폭, 타뷸러) */
font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
font-variant-numeric: tabular-nums;
```

| 용도 | 크기 | 굵기 | 비고 |
|---|---|---|---|
| 페이지 타이틀 | 15px | 600 | header h1 |
| 카드 헤더 제목 | 14px | 600 | `.card-h h3` |
| 일반 본문 | 13px | 400 | |
| 테이블 셀 | 13px | 400 | |
| 요약 카드 큰 숫자 | 24px | 700 | mono, 색상 포함 |
| 예산 전체 숫자 | 20px | 700 | mono |
| 예산 입력 필드 | 22px | 700 | mono |
| 상태 레이블 | 11px | 500–600 | |
| 컬럼 헤더 | 11px | 600 | uppercase + tracking-wider |
| 계정 정보 이름 | 12px | 600 | |
| 계정 정보 이메일 | 11px | 400 | |

---

## 4. 공통 컴포넌트

### 4-1. Button

세 가지 변형이 있고, 높이는 항상 `32px`.

```jsx
// 기본 (secondary)
<button className="btn">내보내기</button>

// 주요 액션 (인디고 채워진 버튼)
<button className="btn btn-primary">
  <PlusIcon />
  새 거래 추가
</button>

// 아이콘 전용 (보더 없음)
<button className="btn btn-ghost px-1.5">
  <ChevronLeftIcon />
</button>

// 위험 (삭제)
<button className="btn btn-danger btn-ghost">
  <TrashIcon />
  삭제
</button>
```

CSS:
```css
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 12px; border-radius: 8px;
  font-size: 13px; font-weight: 500;
  border: 1px solid #e5e7eb; background: #fff; color: #374151;
}
.btn-primary { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.btn-ghost   { border: 0; }
.btn-danger  { color: #dc2626; }
```

### 4-2. Card

```jsx
<div className="card">
  <div className="card-h">
    <h3>카드 제목</h3>
    <span className="ml-2 text-[11px] text-gray-400">보조 설명</span>
    <div className="ml-auto">{/* 우측 액션 */}</div>
  </div>
  <div className="p-[18px]">
    {/* 바디 */}
  </div>
</div>
```

CSS:
```css
.card    { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
.card-h  { padding: 14px 18px; border-bottom: 1px solid #f3f4f6;
           display: flex; align-items: center; gap: 8px; }
.card-h h3 { font-size: 14px; font-weight: 600; color: #111827; }
```

### 4-3. Segmented Control

```jsx
<div className="seg">
  <button className="is-on">전체</button>
  <button>지출</button>
  <button>수입</button>
  <button>이체</button>
</div>
```

CSS:
```css
.seg          { display: inline-flex; background: #f3f4f6; padding: 2px; border-radius: 8px; font-size: 12px; }
.seg button   { padding: 4px 10px; border-radius: 6px; color: #6b7280; font-weight: 500; }
.seg button.is-on { background: #fff; color: #111827; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
```

### 4-4. Field (필터 인풋)

```jsx
<div className="field focus-ring">
  <SearchIcon className="w-3.5 h-3.5 text-gray-400" />
  <input placeholder="검색..." className="flex-1" />
  <kbd>⌘K</kbd>
</div>
```

CSS:
```css
.field {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid #e5e7eb; background: #fff;
  border-radius: 8px; height: 32px; padding: 0 10px;
  font-size: 13px; color: #374151;
}
/* 포커스 시 */
.field:focus-within {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
}
```

### 4-5. Category Chip (카테고리 칩)

```jsx
<span className="chip">
  <span>🍚</span>
  식비
</span>
```

CSS:
```css
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 2px 8px 2px 6px; border-radius: 999px;
  background: #f3f4f6; color: #374151;
  font-size: 12px; font-weight: 500;
}
```

### 4-6. Status Pill (상태 뱃지)

```jsx
<span className="pill ok">정상</span>
<span className="pill warn">페이스 초과</span>
<span className="pill over">예산 초과</span>
<span className="pill idle">미설정</span>
```

| 클래스 | 배경 | 텍스트 색 |
|---|---|---|
| `.pill.ok` | `#ecfdf5` | `#059669` |
| `.pill.warn` | `#fef3c7` | `#b45309` |
| `.pill.over` | `#fee2e2` | `#b91c1c` |
| `.pill.idle` | `#f3f4f6` | `#6b7280` |

CSS base: `display:inline-flex; align-items:center; gap:4px; padding:2px 7px; border-radius:999px; font-size:11px; font-weight:500`

### 4-7. Account Dot (계좌 색 표시)

```jsx
<span className="acc-dot" style={{ background: '#6366f1' }} />
카카오뱅크 체크
```

CSS: `width:8px; height:8px; border-radius:2px; display:inline-block; margin-right:8px`

### 4-8. Amount Input (금액 인풋)

```jsx
<div className="input-amt">
  <input value="700,000" />
  <span className="text-gray-400 text-[12px]">원</span>
</div>
```

CSS:
```css
.input-amt {
  display: inline-flex; align-items: center; gap: 4px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 0 10px; height: 32px; background: #fff;
}
.input-amt input {
  border: 0; outline: 0; background: transparent;
  text-align: right; font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-variant-numeric: tabular-nums;
}
.input-amt:focus-within {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
}
/* 미설정(예산 없음) 상태 */
.input-amt[data-unset] { border-style: dashed; }
```

### 4-9. Progress Bar 세 종류

```jsx
{/* ① 미니 바 - 4~6px (요약 카드) */}
<div className="mini-bar">
  <span style={{ width: '72.8%' }} />
</div>

{/* ② 게이지 - 14px (예산 전체 진행) */}
<div className="gauge">
  <div className="bar" style={{ width: '72.8%' }} />
  <div className="marker" style={{ left: '22.6%' }} />
</div>

{/* ③ b-bar - 8px (예산 테이블 행) */}
<div className="b-bar">
  <span style={{ width: '87.4%', background: '#6366f1' }} />
  <div className="marker" style={{ left: '22.6%' }} />
</div>
```

- **마커**: 오늘까지의 이상 소비 페이스 위치를 표시. `position:absolute; left: (경과일/총일수 * 100)%`
- **바 색상**: 정상 `#6366f1` / 경고(>100%) `#ef4444` / 목표달성 `#22c55e` / 주의 `#f59e0b`

---

## 5. 사이드바 구조

```
w-[232px] shrink-0 bg-white border-r
├── 로고 영역 (h-14, border-b)
│   ├── 인디고 아이콘 박스 (w-7 h-7, rounded-lg, bg-indigo-600)
│   ├── "Monimo" bold 15px
│   └── "v1" 배지 (ml-auto, 10px, gray-400)
├── p-3: btn-primary "새 거래 추가" (w-full)
├── nav (px-3, gap-0.5)
│   ├── 섹션 레이블 "메인" (10px, uppercase, gray-400)
│   ├── nav-item: 거래 내역 + 건수 뱃지
│   ├── nav-item: 대시보드
│   ├── nav-item.active: 현재 페이지 (indigo bg + color)
│   ├── nav-item: 계좌
│   ├── nav-item: 카테고리
│   ├── 섹션 레이블 "계좌" (mt-5)
│   └── nav-item × 4 (acc-dot + 이름 + 잔액)
└── mt-auto p-3 border-t: 유저 프로필
    ├── 아바타 (w-8 h-8, rounded-full, indigo-100 bg, initials)
    ├── 이름 (12px, 600) + 이메일 (11px, gray-500)
    └── 설정 아이콘 버튼 (ml-auto)
```

**Nav Item 상태**
| 상태 | 스타일 |
|---|---|
| 기본 | `color:#374151` |
| 호버 | `background:#f3f4f6` |
| 활성 | `background:#eef2ff; color:#4f46e5; font-weight:600` |

---

## 6. 페이지별 구조 및 컴포넌트

### 6-1. 거래 내역 (`/ledger`)

**헤더**
- 좌: `< 2026년 5월 >` 월 네비 + `오늘` 버튼
- 중앙: 검색 필드 (260px, `⌘K`)
- 우: 내보내기 + 뷰 + 추가 버튼

**요약 카드 (4열 그리드)**
```
이번 달 수입    이번 달 지출    잔여 예산       순자산 변화
4,820,000     2,184,300     815,700       3,483,700
blue 24px     red 24px    + mini-bar      gray 24px
```

**필터 툴바**
- Seg: 전체 / 지출 / 수입 / 이체
- 날짜 범위 field (select)
- 계좌 field (select)
- 카테고리 field (select)
- 필터 버튼
- 우측: N건 표시 중 + 키보드 힌트

**Bulk Action Bar** (선택 시 표시)
- 배경: `bg-gray-900 text-white rounded-xl h-12`
- N개 선택됨 + 카테고리 변경 / 계좌 이동 / 내보내기
- 우측: 선택 해제 + 빨간 삭제 버튼

**스프레드시트 테이블**

컬럼 구성:
```
36px    92px    76px     168px       200px    130px   1fr      56px
checkbox 날짜   타입     카테고리      메모      계좌    금액     액션(⋯)
```

행 종류:
- **컬럼 헤더 행**: `background:#f9fafb; height:32px; font-size:11px uppercase`
- **Quick-add 행**: `background:#fafbff`, inline inputs
- **날짜 그룹 헤더**: `background:#f9fafb; height:28px; font-size:11px`
  - `YYYY.MM.DD 요일명` + 우측에 일별 지출 합계(빨강) / 수입 합계(파랑)
- **거래 행**: 기본 / 선택(`.is-selected`) / 편집(`.is-editing`)
- **합계 행**: `background:#fafbff; font-weight:600; border-top`

행 상태:
| 상태 | 클래스 | 배경 |
|---|---|---|
| 기본 | — | `#fff` |
| 호버 | `:hover .cell` | `#fafbff` |
| 선택 | `.is-selected` | `#eef2ff` (indigo-50) |
| 편집 | `.is-editing` | `#fff` + `box-shadow: inset 0 0 0 2px #4f46e5` |

금액 색상:
- 지출: `color:#ef4444`
- 수입: `color:#3b82f6`
- 이체: `color:#6b7280`

**Detail Panel (340px, 우측 고정)**
```
헤더: "거래 상세" + #id + 닫기(×)
──────────────────────────────────
타입 seg: 지출 / 수입 / 이체
금액 인풋 (큰 숫자, 20px bold)
카테고리 그리드 (5열 × 2행 아이콘 버튼)
날짜 + 시간 (2열 그리드)
계좌 라디오 리스트 (선택 시 indigo 테두리)
메모 textarea (rows=3)
생성/수정 메타 (11px, gray-400)
──────────────────────────────────
푸터: 삭제(btn-danger) + 취소 + 저장(⏎)
```

---

### 6-2. 대시보드 (`/dashboard`)

**헤더**
- 월 네비 + 기간 설명
- 우: 월간/주간/연간 seg + 리포트 버튼

**요약 카드**: 거래 내역과 동일한 4열 구성

**Row 1 — 3열 그리드 (2+1)**

`최근 6개월 수입·지출` (col-span-2):
- SVG `viewBox="0 0 720 240"` 바 차트
- 수입(파랑 막대) + 지출(빨강 막대) + 저축(인디고 영역+라인)
- → React에서는 `Recharts ComposedChart` (Bar + Area + Line) 사용

`카테고리별 지출` (col-span-1):
- CSS `conic-gradient` 도넛 (180px × 180px)
- → React에서는 `Recharts PieChart` + `innerRadius` 사용
- 중앙 텍스트: 총 지출 금액 + "원 · N건"
- 범례 리스트: 색 점 + 카테고리명 + 금액 + %

**Row 2 — 3열 그리드 (2+1)**

`카테고리 예산 사용률` (col-span-2):
- 각 행: `grid-template-columns: 24px 1fr 88px 56px`
- emoji + (이름 + 금액/예산 + 수평 바) + % + 상태 텍스트
- 초과: 빨강, 주의: 앰버, 정상: gray, 여유: green

`일별 지출 강도` (col-span-1):
- 31칸 그리드 히트맵 (`grid-template-columns: repeat(31, 1fr)`)
- 각 칸 높이 34px, 오늘은 `::after` 테두리로 강조
- 강도 클래스: `t-l`(연함) / `t-m`(보통) / `t-h`(진함) / `t-x`(최고)
- 하단: 범례 + 최대지출일 / 무지출일 / 일평균 통계

**Row 3 — 3열 그리드 (2+1)**

`최근 거래` (col-span-2):
- 각 행: 아이콘(w-9 h-9, rounded-lg) + (메모 + 카테고리·계좌·시간) + 금액
- `divide-y divide-gray-100`

`이번 달 인사이트` (col-span-1):
- 카드 4종: 빨강(초과경고) / 앰버(페이스주의) / 인디고(긍정) / 회색(통계)
- 각 카드: 아이콘 + 제목 + 설명 텍스트

---

### 6-3. 예산 (`/budget`)

**헤더**
- `< 2026년 5월 예산 >` + 설명
- 우: 지난달 복사 + 변경사항 저장(`⌘S`)

**월 전체 예산 카드** (`grid-cols-12`, 4+8)
- 좌 (col-span-4): 예산 입력(44px 높이 `input-amt`) + 전월 대비
- 우 (col-span-8): 사용률 숫자 + 14px `gauge` 바 + 페이스 마커 + 예상 설명

**Mini Stats (4열 그리드)**
| 카드 | 숫자 색 |
|---|---|
| 잔여 예산 | gray-900 |
| 초과 카테고리 수 | red-500 |
| 주의 카테고리 수 | amber-500 |
| 설정/전체 카테고리 | gray-900 |

**카테고리별 예산 테이블**

컬럼:
```
32px    1fr          140px      1fr         120px       100px    56px
emoji   이름+통계    예산입력    진행바+숫자   남은금액     상태pill   액션
```

행 구성:
- emoji (18px, 미설정 시 `opacity:0.6`)
- 이름 (13.5px, 600) + 세부 (11px, gray-400: 건수, 평균 단가)
- `input-amt` (예산 없으면 `border-style:dashed; placeholder="미설정"`)
- `b-bar` + 아래 숫자 (사용/예산 (%)형식)
- 남은 금액 (초과 시 `−N,NNN` 빨강/앰버)
- `.pill.ok` / `.pill.warn` / `.pill.over` / `.pill.idle`
- `⋯` 더보기 버튼

**도움말 카드 (2열 그리드)**
- "페이스 마커란?" 설명
- "예산이 처음이라면" 가이드

---

## 7. 인터랙션 패턴

### 키보드 단축키 (거래 내역)
| 키 | 동작 |
|---|---|
| `↑` / `↓` | 행 이동 |
| `Enter` | 편집 모드 토글 |
| `Backspace` / `Delete` | 선택 행 삭제 |
| `⌘K` | 검색 포커스 |
| `⌘S` | 예산 저장 |

### 금액 포맷
```js
// utils/formatCurrency.js
export const formatCurrency = (amount) =>
  amount.toLocaleString('ko-KR') + '원'
// 1284200 → "1,284,200원"

// 지출 표기 (− 기호는 U+2212)
export const formatExpense = (amount) =>
  '−' + Math.abs(amount).toLocaleString('ko-KR')
// -9500 → "−9,500"

// 수입 표기
export const formatIncome = (amount) =>
  '+' + amount.toLocaleString('ko-KR')
// 4520000 → "+4,520,000"
```

### 날짜 포맷
```js
// utils/formatDate.js
export const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-')
  return `${y}.${m.padStart(2,'0')}.${d.padStart(2,'0')}`
}
// "2026-5-7" → "2026.05.07"
```

---

## 8. Recharts 설정 (HTML SVG → React 변환)

### 카테고리 색상 순서 (도넛 & 바 차트)
```js
export const CHART_COLORS = [
  '#6366f1', // 식비 (indigo-500)
  '#f59e0b', // 주거·공과금 (amber)
  '#ef4444', // 쇼핑 (red)
  '#3b82f6', // 의료·건강 (blue)
  '#10b981', // 문화·여가 (emerald)
  '#8b5cf6', // 카페·간식 (violet)
  '#22c55e', // 저축·투자 (green)
  '#10b981', // 교육 (emerald)
  '#6b7280', // 교통 (gray)
  '#ec4899', // 기타 (pink)
]
```

### 6개월 추이 차트 (ComposedChart)
- `Bar` × 2: 수입(blue, opacity 0.85) / 지출(red, opacity 0.85)
- `Area` + `Line`: 저축 = 수입 − 지출 (indigo, 영역 그라디언트)
- `XAxis`: 월 레이블, `YAxis`: 만 단위

### 도넛 차트 (PieChart)
- `Pie`: `innerRadius={60}` `outerRadius={90}`
- 중앙 커스텀 레이블: 총 지출 + "원 · N건"

---

## 9. 반응형 기준

- 기준 뷰포트: `width=1440` (데스크톱 고정, 현재 MVP)
- 최소 권장 너비: ~1100px (사이드바 232px + 메인 최소 800px)
- 모바일 반응형은 MVP 이후 단계
