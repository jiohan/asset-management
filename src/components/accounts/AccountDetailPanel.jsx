import { useState, useMemo } from 'react'
import { useAccountDetail } from '../../hooks/useAccountDetail'
import { ACCOUNT_TYPE_LABELS } from '../../utils/accountTypes'

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

function formatAmt(n) {
  return Math.abs(n).toLocaleString('ko-KR')
}

export default function AccountDetailPanel({ account, onClose, onEdit, onDelete }) {
  const isOpen = !!account
  const [month, setMonth] = useState(getToday)
  const [detailRefresh] = useState(0)

  const { transactions, transfers, loading } = useAccountDetail(
    account?.id,
    month,
    detailRefresh
  )

  const summary = useMemo(() => {
    if (!transactions && !transfers) return { income: 0, expense: 0, transferIn: 0, transferOut: 0 }
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const transferIn = transfers.filter(t => t.to_account_id === account?.id).reduce((s, t) => s + t.amount, 0)
    const transferOut = transfers.filter(t => t.from_account_id === account?.id).reduce((s, t) => s + t.amount, 0)
    return { income, expense, transferIn, transferOut }
  }, [transactions, transfers, account])

  // Build unified timeline sorted by date desc
  const timeline = useMemo(() => {
    const items = []
    for (const tx of transactions) {
      items.push({ kind: 'tx', date: tx.date, createdAt: tx.created_at, data: tx })
    }
    for (const tr of transfers) {
      items.push({ kind: 'transfer', date: tr.date, createdAt: tr.created_at, data: tr })
    }
    items.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date)
      return b.createdAt.localeCompare(a.createdAt)
    })
    return items
  }, [transactions, transfers])

  // Group by date
  const grouped = useMemo(() => {
    const map = {}
    for (const item of timeline) {
      if (!map[item.date]) map[item.date] = []
      map[item.date].push(item)
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [timeline])

  const isCurrentMonth = month === getToday()

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 bg-black/20 z-10" onClick={onClose} />
      )}

      <div
        className={`absolute top-0 right-0 bottom-0 w-[340px] bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {account && (
          <>
            {/* Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: account.color }}
                />
                <span className="text-[13px] font-semibold text-gray-800 truncate">
                  {account.name}
                </span>
                <span className="pill idle shrink-0 text-[10px]">
                  {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onEdit}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-150"
                  title="편집"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={onDelete}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                  title="삭제"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 3h9M5 3V2h3v1M4 3v7h5V3H4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150 ml-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Month Nav */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
              <button
                onClick={() => setMonth(prevMonth(month))}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-gray-700">
                  {formatMonthLabel(month)}
                </span>
                {!isCurrentMonth && (
                  <button
                    onClick={() => setMonth(getToday())}
                    className="text-[11px] text-indigo-500 hover:underline"
                  >
                    이번 달
                  </button>
                )}
              </div>
              <button
                onClick={() => setMonth(nextMonth(month))}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors duration-150"
                disabled={isCurrentMonth}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke={isCurrentMonth ? '#d1d5db' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Summary */}
            <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">수입</span>
                <span className="text-[12px] font-medium text-blue-500 mono">
                  +{formatAmt(summary.income)}원
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">지출</span>
                <span className="text-[12px] font-medium text-red-500 mono">
                  −{formatAmt(summary.expense)}원
                </span>
              </div>
              {(summary.transferIn > 0 || summary.transferOut > 0) && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">이체 입금</span>
                    <span className="text-[12px] font-medium text-teal-500 mono">
                      +{formatAmt(summary.transferIn)}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">이체 출금</span>
                    <span className="text-[12px] font-medium text-orange-500 mono">
                      −{formatAmt(summary.transferOut)}원
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-[13px] text-gray-400">이 달 내역이 없어요</p>
                </div>
              ) : (
                grouped.map(([date, items]) => (
                  <div key={date}>
                    <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                      <span className="text-[11px] font-medium text-gray-500">{formatDate(date)}</span>
                    </div>
                    {items.map((item, idx) => (
                      item.kind === 'tx'
                        ? <TxRow key={`tx-${item.data.id}`} tx={item.data} />
                        : <TransferRow
                            key={`tr-${item.data.id}-${idx}`}
                            transfer={item.data}
                            accountId={account.id}
                          />
                    ))}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function TxRow({ tx }) {
  const isExpense = tx.type === 'expense'
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100">
      <span className="text-[18px] leading-none shrink-0">
        {tx.categories?.icon ?? '💳'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-800 truncate">
          {tx.categories?.name ?? '기타'}
        </p>
        {tx.note && (
          <p className="text-[11px] text-gray-400 truncate">{tx.note}</p>
        )}
      </div>
      <span className={`text-[13px] font-semibold mono shrink-0 ${isExpense ? 'text-red-500' : 'text-blue-500'}`}>
        {isExpense ? '−' : '+'}{tx.amount.toLocaleString('ko-KR')}
      </span>
    </div>
  )
}

function TransferRow({ transfer, accountId }) {
  const isOut = transfer.from_account_id === accountId
  const counterparty = isOut ? transfer.to_account : transfer.from_account
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100">
      <span className="text-[16px] leading-none shrink-0">{isOut ? '→' : '←'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-800 truncate">
          이체 {isOut ? '출금' : '입금'}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {counterparty?.color && (
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: counterparty.color }} />
          )}
          <p className="text-[11px] text-gray-400 truncate">
            {isOut ? `→ ${counterparty?.name ?? '?'}` : `← ${counterparty?.name ?? '?'}`}
          </p>
        </div>
      </div>
      <span className={`text-[13px] font-semibold mono shrink-0 ${isOut ? 'text-orange-500' : 'text-teal-500'}`}>
        {isOut ? '−' : '+'}{transfer.amount.toLocaleString('ko-KR')}
      </span>
    </div>
  )
}
