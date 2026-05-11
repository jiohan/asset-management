import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useMonthBudget } from '../hooks/useMonthBudget'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useLedgerRefresh } from '../contexts/LedgerRefreshContext'
import { useTransfers } from '../hooks/useTransfers'
import TransactionDetailPanel from '../components/transactions/TransactionDetailPanel'

function getToday() {
  return new Date().toISOString().slice(0, 7)
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

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${dateStr.replace(/-/g, '.')} ${days[d.getDay()]}`
}

function groupByDate(txs) {
  return txs.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {})
}

function getDayTotals(txs) {
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  return { expense, income }
}

function computeSummary(transactions, monthlyBudget) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const hasBudget = monthlyBudget > 0
  const remaining = hasBudget ? monthlyBudget - totalExpense : null
  const usedRatio = hasBudget ? Math.min(totalExpense / monthlyBudget, 1) : 0
  let barColor = '#4f46e5'
  if (hasBudget) {
    const pct = totalExpense / monthlyBudget
    if (pct >= 1) barColor = '#ef4444'
    else if (pct >= 0.8) barColor = '#f59e0b'
  }
  return { totalIncome, totalExpense, remaining, usedRatio, barColor, hasBudget, netChange: totalIncome - totalExpense }
}

function applyFilters(transactions, typeFilter, accountFilter, categoryFilter) {
  return transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    if (accountFilter !== '' && tx.account_id !== accountFilter) return false
    if (categoryFilter !== '' && tx.category_id !== categoryFilter) return false
    return true
  })
}

function normalizeTransfers(transfers) {
  return transfers.map(tr => ({
    id: tr.id,
    type: 'transfer',
    date: tr.date,
    created_at: tr.created_at,
    amount: tr.amount,
    note: tr.note,
    categories: null,
    category_id: null,
    account_id: tr.from_account_id,
    accounts: tr.from_account,
    from_account: tr.from_account,
    to_account: tr.to_account,
    _isTransfer: true,
  }))
}

function SummaryCard({ label, value, valueClass = '' }) {
  return (
    <div className="card px-4 py-3 flex flex-col gap-1.5">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className={`mono text-[22px] font-bold leading-tight ${valueClass}`}>{value}</span>
    </div>
  )
}

const TYPE_TABS = [
  { key: 'all',      label: '전체' },
  { key: 'expense',  label: '지출' },
  { key: 'income',   label: '수입' },
  { key: 'transfer', label: '이체' },
]

export default function LedgerPage() {
  const todayYM = getToday()
  const [month, setMonth] = useState(todayYM)
  const { refreshKey, triggerRefresh } = useLedgerRefresh()
  const { transactions, loading, error } = useTransactions(month, refreshKey)
  const { transfers, loading: trLoading, error: trError } = useTransfers(month, refreshKey)
  const { monthlyBudget } = useMonthBudget()
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const [typeFilter, setTypeFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [selectedTx, setSelectedTx] = useState(null)

  function handleSelectTx(tx) {
    setSelectedTx(tx)
  }

  function handlePanelClose() {
    setSelectedTx(null)
  }

  function handlePanelSaved() {
    setSelectedTx(null)
    triggerRefresh()
  }

  function handlePanelDeleted() {
    setSelectedTx(null)
    triggerRefresh()
  }

  const hasActiveFilter = typeFilter !== 'all' || accountFilter !== '' || categoryFilter !== ''

  function resetFilters() {
    setTypeFilter('all')
    setAccountFilter('')
    setCategoryFilter('')
  }

  function handleTypeChange(key) {
    setTypeFilter(key)
    setCategoryFilter('')
  }

  const allEntries = useMemo(() => {
    const normalized = normalizeTransfers(transfers)
    return [...transactions, ...normalized].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [transactions, transfers])

  const summary = useMemo(
    () => computeSummary(transactions, monthlyBudget ?? 0),
    [transactions, monthlyBudget]
  )

  const visibleCategories = useMemo(() => {
    if (typeFilter === 'expense' || typeFilter === 'income') {
      return categories.filter(c => c.type === typeFilter)
    }
    return categories
  }, [categories, typeFilter])

  const displayedEntries = useMemo(
    () => applyFilters(allEntries, typeFilter, accountFilter, categoryFilter),
    [allEntries, typeFilter, accountFilter, categoryFilter]
  )

  const combinedLoading = loading || trLoading
  const combinedError = error || trError
  const grouped = groupByDate(displayedEntries)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
  const isCurrentMonth = month === todayYM

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">

      {/* [1] 월 네비게이션 헤더 */}
      <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(prevMonth(month))}
            aria-label="이전 달"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[15px] font-semibold text-gray-900 min-w-[110px] text-center">
            {formatMonthLabel(month)}
          </span>
          <button
            onClick={() => setMonth(nextMonth(month))}
            aria-label="다음 달"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={() => setMonth(todayYM)}
            className="btn btn-ghost text-[12px] text-indigo-600 hover:bg-indigo-50"
          >
            오늘
          </button>
        )}
      </div>

      {/* [2] 요약 카드 (raw transactions 기준 — 필터 영향 없음) */}
      <div className="px-6 py-4 border-b border-gray-200 shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <SummaryCard
            label="이번 달 수입"
            value={`+${summary.totalIncome.toLocaleString('ko-KR')}원`}
            valueClass="text-blue-500"
          />
          <SummaryCard
            label="이번 달 지출"
            value={`−${summary.totalExpense.toLocaleString('ko-KR')}원`}
            valueClass="text-red-500"
          />
          <div className="card px-4 py-3 flex flex-col gap-1.5">
            <span className="text-[12px] text-gray-500">잔여 예산</span>
            {summary.hasBudget ? (
              <>
                <span className={`mono text-[22px] font-bold leading-tight ${
                  summary.remaining < 0 ? 'text-red-500' : 'text-gray-900'
                }`}>
                  {summary.remaining < 0 ? '−' : ''}{Math.abs(summary.remaining).toLocaleString('ko-KR')}원
                </span>
                <div className="h-[4px] bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(summary.usedRatio * 100)}%`, backgroundColor: summary.barColor }}
                  />
                </div>
              </>
            ) : (
              <span className="text-[14px] text-gray-400">예산 미설정</span>
            )}
          </div>
          <SummaryCard
            label="순자산 변화"
            value={`${summary.netChange >= 0 ? '+' : '−'}${Math.abs(summary.netChange).toLocaleString('ko-KR')}원`}
            valueClass={summary.netChange >= 0 ? 'text-gray-900' : 'text-red-500'}
          />
        </div>
      </div>

      {/* [3] 필터 툴바 */}
      <div className="px-6 py-2.5 border-b border-gray-200 bg-white shrink-0 flex items-center gap-3">
        <div className="seg">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={typeFilter === tab.key ? 'is-on' : ''}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={accountFilter}
          onChange={e => setAccountFilter(e.target.value)}
          className="h-7 border border-gray-200 rounded-lg bg-white text-[12px] text-gray-700 px-2.5 cursor-pointer hover:border-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors duration-150"
        >
          <option value="">전체 계좌</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-7 border border-gray-200 rounded-lg bg-white text-[12px] text-gray-700 px-2.5 cursor-pointer hover:border-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors duration-150"
        >
          <option value="">전체 카테고리</option>
          {visibleCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        {hasActiveFilter && (
          <button
            onClick={resetFilters}
            className="h-7 px-2.5 rounded-lg text-[12px] text-gray-500 border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            초기화
          </button>
        )}

        <span className="ml-auto text-[12px] text-gray-400">
          {displayedEntries.length}건 표시 중
        </span>
      </div>

      {/* [4] 거래 목록 (스크롤) */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="card">

          {/* 컬럼 헤더 */}
          <div className="flex items-center px-5 h-8 bg-gray-50 border-b border-gray-100 rounded-t-xl">
            <div className="w-[180px] shrink-0">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">카테고리</span>
            </div>
            <div className="flex-1 px-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">메모</span>
            </div>
            <div className="w-[120px] shrink-0">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">계좌</span>
            </div>
            <div className="w-[120px] text-right shrink-0">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">금액</span>
            </div>
          </div>

          {/* 로딩 스켈레톤 */}
          {combinedLoading && (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 h-[44px] animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="h-2.5 w-36 bg-gray-100 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* 에러 */}
          {combinedError && (
            <div className="m-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">
              {combinedError}
            </div>
          )}

          {/* 빈 상태 — 해당 달 거래 없음 */}
          {!combinedLoading && !combinedError && transactions.length === 0 && transfers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-[14px] font-medium text-gray-600">이번 달 거래가 없어요</p>
              <p className="text-[12px] text-gray-400 mt-1">사이드바의 새 거래 추가 버튼으로 첫 거래를 기록해보세요</p>
            </div>
          )}

          {/* 빈 상태 — 거래는 있지만 필터로 모두 제외됨 */}
          {!combinedLoading && !combinedError && allEntries.length > 0 && displayedEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                  <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6L14 13.667V19a1 1 0 0 1-1.447.894l-4-2A1 1 0 0 1 8 17v-3.333L3.2 5.6A1 1 0 0 1 3 5V4z"
                    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <p className="text-[14px] font-medium text-gray-600">필터 조건에 맞는 거래가 없어요</p>
              <button
                onClick={resetFilters}
                className="mt-3 text-[12px] text-indigo-500 hover:text-indigo-700 underline cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* 날짜 그룹별 목록 */}
          {!combinedLoading && !combinedError && sortedDates.map(date => {
            const txs = grouped[date]
            const { expense, income } = getDayTotals(txs)
            return (
              <div key={date}>
                <div className="flex items-center px-5 h-8 bg-gray-50 border-y border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-600">{formatDate(date)}</span>
                  <div className="ml-auto flex items-center gap-3">
                    {expense > 0 && (
                      <span className="mono text-[11px] font-semibold text-red-500">
                        −{expense.toLocaleString('ko-KR')}원
                      </span>
                    )}
                    {income > 0 && (
                      <span className="mono text-[11px] font-semibold text-blue-500">
                        +{income.toLocaleString('ko-KR')}원
                      </span>
                    )}
                  </div>
                </div>
                {txs.map(tx => (
                  <div
                    key={tx.id}
                    onClick={tx._isTransfer ? undefined : () => handleSelectTx(tx)}
                    className={`flex items-center px-5 h-[44px] hover:bg-[#fafbff] border-b border-gray-50 last:border-0 transition-colors duration-150 ${
                      tx._isTransfer ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="w-[180px] flex items-center gap-2.5 shrink-0">
                      {tx._isTransfer ? (
                        <>
                          <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[16px] shrink-0 leading-none">
                            ↔
                          </span>
                          <span className="text-[13px] font-medium text-gray-500 truncate">이체</span>
                        </>
                      ) : (
                        <>
                          <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[16px] shrink-0 leading-none">
                            {tx.categories?.icon}
                          </span>
                          <span className="text-[13px] font-medium text-gray-800 truncate">
                            {tx.categories?.name}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 px-4">
                      <span className="text-[12px] text-gray-400 truncate block">{tx.note || '—'}</span>
                    </div>
                    <div className="w-[120px] flex items-center gap-1.5 shrink-0">
                      {tx._isTransfer ? (
                        <span className="text-[12px] text-gray-500 truncate">
                          {tx.from_account?.name} → {tx.to_account?.name}
                        </span>
                      ) : (
                        tx.accounts && (
                          <>
                            <span className="acc-dot shrink-0" style={{ background: tx.accounts.color ?? '#6b7280' }} />
                            <span className="text-[12px] text-gray-500 truncate">{tx.accounts.name}</span>
                          </>
                        )
                      )}
                    </div>
                    <div className="w-[120px] text-right shrink-0">
                      <span className={`mono text-[13px] font-semibold ${
                        tx._isTransfer ? 'text-purple-500' : tx.type === 'expense' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {tx._isTransfer ? '' : tx.type === 'expense' ? '−' : '+'}{tx.amount.toLocaleString('ko-KR')}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

        </div>
      </div>
      <TransactionDetailPanel
        transaction={selectedTx}
        onClose={handlePanelClose}
        onSaved={handlePanelSaved}
        onDeleted={handlePanelDeleted}
      />
    </div>
  )
}
