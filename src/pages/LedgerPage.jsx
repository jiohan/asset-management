import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'

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

export default function LedgerPage() {
  const [month] = useState(() => new Date().toISOString().slice(0, 7))
  const { transactions, loading, error } = useTransactions(month)

  const grouped = groupByDate(transactions)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
          {loading && (
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
          {error && (
            <div className="m-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* 빈 상태 */}
          {!loading && !error && transactions.length === 0 && (
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

          {/* 날짜 그룹별 목록 */}
          {!loading && !error && sortedDates.map(date => {
            const txs = grouped[date]
            const { expense, income } = getDayTotals(txs)
            return (
              <div key={date}>
                {/* 날짜 그룹 헤더 */}
                <div className="flex items-center px-5 h-8 bg-gray-50 border-y border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-600">
                    {formatDate(date)}
                  </span>
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

                {/* 거래 행 */}
                {txs.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center px-5 h-[44px] hover:bg-[#fafbff] cursor-pointer border-b border-gray-50 last:border-0 transition-colors duration-150"
                  >
                    {/* 카테고리 */}
                    <div className="w-[180px] flex items-center gap-2.5 shrink-0">
                      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[16px] shrink-0 leading-none">
                        {tx.categories?.icon}
                      </span>
                      <span className="text-[13px] font-medium text-gray-800 truncate">
                        {tx.categories?.name}
                      </span>
                    </div>

                    {/* 메모 */}
                    <div className="flex-1 min-w-0 px-4">
                      <span className="text-[12px] text-gray-400 truncate block">
                        {tx.note || '—'}
                      </span>
                    </div>

                    {/* 계좌 */}
                    <div className="w-[120px] flex items-center gap-1.5 shrink-0">
                      {tx.accounts && (
                        <>
                          <span
                            className="acc-dot shrink-0"
                            style={{ background: tx.accounts.color ?? '#6b7280' }}
                          />
                          <span className="text-[12px] text-gray-500 truncate">
                            {tx.accounts.name}
                          </span>
                        </>
                      )}
                    </div>

                    {/* 금액 */}
                    <div className="w-[120px] text-right shrink-0">
                      <span className={`mono text-[13px] font-semibold ${tx.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                        {tx.type === 'expense' ? '−' : '+'}{tx.amount.toLocaleString('ko-KR')}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
