# Monimo — 디자인 시스템

## 기본 원칙

- 밝고 깔끔한 화이트 계열 (라이트 모드 전용, MVP 기준)
- 포인트 컬러: 인디고(Indigo) 계열
- 불필요한 장식 없이 정보 중심 레이아웃
- 모바일 우선(Mobile-first) 반응형

## 색상 팔레트 (Tailwind 클래스 기준)

| 용도 | Tailwind 클래스 | 색상 |
|------|-----------------|------|
| 배경 (기본) | `bg-white` | #ffffff |
| 배경 (서브) | `bg-gray-50` | #f9fafb |
| 포인트 (주요 버튼, 강조) | `bg-indigo-600` | #4f46e5 |
| 포인트 (호버) | `bg-indigo-700` | #4338ca |
| 포인트 (연한) | `bg-indigo-50` | #eef2ff |
| 텍스트 (기본) | `text-gray-900` | #111827 |
| 텍스트 (보조) | `text-gray-500` | #6b7280 |
| 텍스트 (비활성) | `text-gray-400` | #9ca3af |
| 테두리 | `border-gray-200` | #e5e7eb |
| 지출 표시 | `text-red-500` | #ef4444 |
| 수입 표시 | `text-blue-500` | #3b82f6 |
| 이체 표시 | `text-gray-500` | #6b7280 |
| 경고 (예산 초과) | `text-red-600` | #dc2626 |
| 성공/안전 | `text-green-500` | #22c55e |

## 타이포그래피

| 용도 | Tailwind 클래스 |
|------|-----------------|
| 페이지 제목 | `text-2xl font-bold text-gray-900` |
| 섹션 제목 | `text-lg font-semibold text-gray-900` |
| 금액 (큰 숫자) | `text-3xl font-bold` |
| 금액 (일반) | `text-base font-medium` |
| 본문 | `text-sm text-gray-700` |
| 보조 텍스트 | `text-xs text-gray-500` |

## 공통 컴포넌트 패턴

### Button

```jsx
// Primary
<button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
// Secondary
<button className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
// Danger
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
```

### Card

```jsx
<div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
```

### Input

```jsx
<input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
```

### Badge (카테고리 타입 등)

```jsx
// 지출
<span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full">지출</span>
// 수입
<span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">수입</span>
// 이체
<span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">이체</span>
```

## 금액 표시 유틸

```js
// utils/formatCurrency.js
export const formatCurrency = (amount) =>
  amount.toLocaleString('ko-KR') + '원'

// 사용 예: formatCurrency(150000) → "150,000원"
```

## 날짜 표시 유틸

```js
// utils/formatDate.js
export const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-')
  return `${y}.${m}.${d}`
}

// 사용 예: formatDate('2026-05-07') → "2026.05.07"
```

## Recharts 차트 설정

도넛 차트 기본 색상 순서:
```js
const CHART_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6b7280', // gray
]
```
