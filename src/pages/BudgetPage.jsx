import { useState, useMemo } from 'react'
import { useLedgerRefresh } from '../contexts/LedgerRefreshContext'
import { useMonthBudgetData } from '../hooks/useMonthBudgetData'
import { useMonthExpenseByCategory } from '../hooks/useMonthExpenseByCategory'
import TotalBudgetModal from '../components/budget/TotalBudgetModal'
import CategoryBudgetModal from '../components/budget/CategoryBudgetModal'

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(ym) {
  const [year, mon] = ym.split('-')
  return `${year}년 ${Number(mon)}월`
}

function prevMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getBarColor(pct) {
  if (pct >= 0.9) return '#ef4444'
  if (pct >= 0.7) return '#f97316'
  return '#4f46e5'
}

function CategoryBudgetRow({ budget, expense, onClick }) {
  const pct = budget.amount > 0 ? expense / budget.amount : 0
  const barColor = getBarColor(pct)
  const remaining = budget.amount - expense
  const isOver = remaining < 0

  return (
    <div
      className={`px-5 py-3.5 cursor-pointer hover:bg-[#fafbff] transition-colors ${isOver ? 'bg-red-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[18px] w-6 shrink-0">{budget.categoryIcon}</span>
        <span className="flex-1 text-[13px] font-medium text-gray-800">{budget.categoryName}</span>
        <span className="mono text-[13px] font-semibold text-gray-900">
          {budget.amount.toLocaleString('ko-KR')}원
        </span>
      </div>
      <div className="ml-9 space-y-1.5">
        <div className="b-bar">
          <span style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }} />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400">
          <span className="mono">{expense.toLocaleString('ko-KR')} / {budget.amount.toLocaleString('ko-KR')}</span>
          <span className={`font-medium ${isOver ? 'text-red-500' : ''}`}>
            {isOver
              ? `${Math.abs(remaining).toLocaleString('ko-KR')}원 초과`
              : `${remaining.toLocaleString('ko-KR')}원 남음`}
          </span>
        </div>
      </div>
    </div>
  )
}

function OtherBudgetRow({ otherBudget, otherExpense, totalBudget }) {
  if (totalBudget === 0) return null

  const isOverflow = otherBudget < 0
  const pct = otherBudget > 0 ? otherExpense / otherBudget : 0
  const barColor = getBarColor(pct)

  return (
    <div className={`px-5 py-3.5 ${isOverflow ? 'bg-red-50' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[18px] w-6 shrink-0">➕</span>
        <span className="flex-1 text-[13px] font-medium text-gray-800">기타</span>
        <span className="text-[11px] text-gray-400 mr-2">(자동)</span>
        <span className={`mono text-[13px] font-semibold ${isOverflow ? 'text-red-500' : 'text-gray-900'}`}>
          {isOverflow ? '−' : ''}{Math.abs(otherBudget).toLocaleString('ko-KR')}원
        </span>
      </div>
      {isOverflow ? (
        <p className="ml-9 text-[11px] text-red-500 font-medium">
          카테고리 예산 합계가 전체 예산을 초과했습니다
        </p>
      ) : (
        <div className="ml-9 space-y-1.5">
          <div className="b-bar">
            <span style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }} />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400">
            <span className="mono">{otherExpense.toLocaleString('ko-KR')} / {otherBudget.toLocaleString('ko-KR')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function TotalBudgetCard({ totalBudget, totalExpense, onEdit }) {
  if (totalBudget === 0) {
    return (
      <div className="card p-6 flex flex-col items-center gap-3">
        <p className="text-[14px] text-gray-500">이번 달 예산이 설정되지 않았어요</p>
        <button className="btn btn-primary" onClick={onEdit}>예산 설정</button>
      </div>
    )
  }

  const pct = totalExpense / totalBudget
  const barColor = getBarColor(pct)
  const pctDisplay = Math.round(pct * 100)
  const remaining = totalBudget - totalExpense
  const isOver = remaining < 0

  return (
    <div className="card">
      <div className="card-h">
        <h3>이번 달 예산</h3>
        <div className="ml-auto">
          <button className="btn btn-ghost text-[12px]" onClick={onEdit}>수정</button>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-gray-500">
            <span className="mono text-[20px] font-bold text-gray-900">{totalBudget.toLocaleString('ko-KR')}</span>
            원 중{' '}
            <span className="mono text-[16px] font-semibold" style={{ color: barColor }}>
              {totalExpense.toLocaleString('ko-KR')}
            </span>
            원 사용
          </span>
          <span className="text-[13px] font-semibold" style={{ color: barColor }}>{pctDisplay}%</span>
        </div>

        <div className="gauge">
          <div
            className="bar"
            style={{
              width: `${Math.min(pct * 100, 100)}%`,
              background: barColor,
              borderRadius: '999px',
              height: '100%',
            }}
          />
        </div>

        <p className={`text-[13px] font-medium ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
          {isOver
            ? `${Math.abs(remaining).toLocaleString('ko-KR')}원 초과`
            : `${remaining.toLocaleString('ko-KR')}원 남음`}
        </p>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const todayYM = getToday()
  const [month, setMonth] = useState(todayYM)
  const [showTotalModal, setShowTotalModal] = useState(false)
  const [editingCategoryBudget, setEditingCategoryBudget] = useState(null)

  const { refreshKey, triggerRefresh } = useLedgerRefresh()
  const { totalBudget, categoryBudgets, isCarriedOver, loading, error } = useMonthBudgetData(month, refreshKey)
  const { expenseByCategory, totalExpense, loading: expLoading } = useMonthExpenseByCategory(month, refreshKey)
  const isLoading = loading || expLoading

  const sumCategoryBudgets = useMemo(
    () => categoryBudgets.reduce((s, b) => s + b.amount, 0),
    [categoryBudgets]
  )
  const otherBudget = totalBudget - sumCategoryBudgets
  const budgetedCategoryIds = useMemo(
    () => new Set(categoryBudgets.map(b => b.categoryId)),
    [categoryBudgets]
  )
  const otherExpense = useMemo(() => {
    let sum = totalExpense
    for (const [catId, amt] of expenseByCategory) {
      if (budgetedCategoryIds.has(catId)) sum -= amt
    }
    return Math.max(sum, 0)
  }, [expenseByCategory, totalExpense, budgetedCategoryIds])

  function handleMutationComplete() {
    setShowTotalModal(false)
    setEditingCategoryBudget(null)
    triggerRefresh()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Month navigation header */}
      <div className="h-14 border-b border-gray-100 bg-white flex items-center px-6 gap-3 shrink-0">
        <button className="btn btn-ghost px-1.5" onClick={() => setMonth(prevMonth(month))}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-gray-900 min-w-[110px] text-center">
          {formatMonthLabel(month)}
        </span>
        <button className="btn btn-ghost px-1.5" onClick={() => setMonth(nextMonth(month))}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {month !== todayYM && (
          <button className="btn btn-ghost text-[12px] text-indigo-600 ml-1" onClick={() => setMonth(todayYM)}>
            오늘
          </button>
        )}
      </div>

      {/* Carry-over banner */}
      {isCarriedOver && !isLoading && (
        <div className="mx-6 mt-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-[13px] text-amber-700 shrink-0">
          <span>✏️</span>
          <span>이전 달 예산을 불러왔습니다. 수정하면 이번 달 예산으로 저장됩니다.</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="card p-5 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-8 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
            <div className="card p-5 space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-12 bg-gray-100 rounded" />
              <div className="h-12 bg-gray-100 rounded" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-3">
            {error}
          </div>
        ) : (
          <>
            <TotalBudgetCard
              totalBudget={totalBudget}
              totalExpense={totalExpense}
              onEdit={() => setShowTotalModal(true)}
            />
            <div className="card">
              <div className="card-h">
                <h3>카테고리별 예산</h3>
                <div className="ml-auto">
                  <button className="btn btn-ghost px-2" onClick={() => setEditingCategoryBudget('new')}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                    </svg>
                    추가
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {categoryBudgets.length === 0 && (
                  <p className="py-10 text-center text-[13px] text-gray-400">카테고리 예산을 추가해보세요</p>
                )}
                {categoryBudgets.map(budget => (
                  <CategoryBudgetRow
                    key={budget.categoryId}
                    budget={budget}
                    expense={expenseByCategory.get(budget.categoryId) ?? 0}
                    onClick={() => setEditingCategoryBudget(budget)}
                  />
                ))}
                <OtherBudgetRow
                  otherBudget={otherBudget}
                  otherExpense={otherExpense}
                  totalBudget={totalBudget}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <TotalBudgetModal
        isOpen={showTotalModal}
        onClose={() => setShowTotalModal(false)}
        month={month}
        initialAmount={totalBudget}
        onSaved={handleMutationComplete}
      />

      <CategoryBudgetModal
        isOpen={!!editingCategoryBudget}
        onClose={() => setEditingCategoryBudget(null)}
        mode={editingCategoryBudget === 'new' ? 'add' : 'edit'}
        budgetEntry={editingCategoryBudget === 'new' ? null : editingCategoryBudget}
        month={month}
        budgetedCategoryIds={budgetedCategoryIds}
        onSaved={handleMutationComplete}
        onDeleted={handleMutationComplete}
      />
    </div>
  )
}
