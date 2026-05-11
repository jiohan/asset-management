import { useState, useEffect } from 'react'
import { useUpdateTransaction } from '../../hooks/useUpdateTransaction'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'

const TYPE_OPTIONS = [
  { key: 'expense', label: '지출' },
  { key: 'income', label: '수입' },
]

export default function TransactionDetailPanel({ transaction, onClose, onSaved, onDeleted }) {
  const { updateTransaction, loading: saving } = useUpdateTransaction()
  const { deleteTransaction, loading: deleting } = useDeleteTransaction()
  const { categories } = useCategories()
  const { accounts, loading: accountsLoading } = useAccounts()

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!transaction) return
    setType(transaction.type)
    setAmount(String(transaction.amount))
    setCategoryId(transaction.category_id)
    setAccountId(transaction.account_id ?? '')
    setDate(transaction.date)
    setNote(transaction.note ?? '')
    setShowDeleteConfirm(false)
    setSaveError(null)
  }, [transaction])

  function handleTypeChange(newType) {
    setType(newType)
    setCategoryId(null)
  }

  const visibleCategories = categories.filter(c => c.type === type)
  const canSave = Number(amount) > 0 && categoryId !== null && !!accountId
  const isOpen = !!transaction

  async function handleSave() {
    if (!canSave || saving) return
    setSaveError(null)
    const result = await updateTransaction(transaction.id, {
      type,
      amount: Number(amount),
      categoryId,
      accountId: accountId || null,
      date,
      note: note.trim() || null,
    })
    if (result) onSaved(result)
    else setSaveError('저장에 실패했습니다.')
  }

  async function handleDelete() {
    if (deleting) return
    const ok = await deleteTransaction(transaction.id)
    if (ok) onDeleted()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="absolute inset-0 bg-black/20 z-10" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-[340px] bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {transaction && (
          <>
            {/* Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
              <span className="text-[13px] font-semibold text-gray-800">거래 상세</span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-150 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* 타입 세그먼트 */}
              <div className="seg">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleTypeChange(opt.key)}
                    className={type === opt.key ? 'is-on' : ''}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* 금액 */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">금액</label>
                <div className={`flex items-center gap-2 border rounded-lg px-3 h-11 transition-colors duration-150 ${
                  type === 'expense'
                    ? 'border-red-200 focus-within:border-red-400'
                    : 'border-blue-200 focus-within:border-blue-400'
                }`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
                    onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className={`flex-1 min-w-0 bg-transparent outline-none text-right font-mono text-[20px] font-bold placeholder:text-gray-300 ${
                      type === 'expense' ? 'text-red-500' : 'text-blue-500'
                    }`}
                  />
                  <span className="text-[13px] text-gray-400 shrink-0">원</span>
                </div>
              </div>

              {/* 카테고리 그리드 (5열) */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1.5 block">카테고리</label>
                <div className="grid grid-cols-5 gap-1">
                  {visibleCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-center transition-colors duration-150 cursor-pointer ${
                        categoryId === cat.id
                          ? 'bg-indigo-50 ring-1 ring-indigo-400'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[18px] leading-none">{cat.icon}</span>
                      <span className="text-[9px] text-gray-600 leading-tight truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 날짜 */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">날짜</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="field w-full"
                />
              </div>

              {/* 계좌 */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1.5 block">계좌</label>
                {accountsLoading ? (
                  <p className="text-[12px] text-gray-400">계좌 로딩 중…</p>
                ) : accounts.length === 0 ? (
                  <p className="text-[12px] text-amber-600">계좌가 없어요. 계좌 탭에서 추가해주세요.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {accounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setAccountId(acc.id)}
                        className={`h-7 px-2.5 rounded-full border text-[12px] flex items-center gap-1.5 transition-colors duration-150 cursor-pointer ${
                          accountId === acc.id
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="acc-dot shrink-0" style={{ background: acc.color ?? '#6b7280' }} />
                        {acc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 메모 */}
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block">메모</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="메모 (선택)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-800 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* 등록 시각 */}
              <p className="text-[11px] text-gray-400">
                등록: {new Date(transaction.created_at).toLocaleString('ko-KR', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>

              {saveError && (
                <p className="text-[12px] text-red-500">{saveError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-3 border-t border-gray-200">
              {!showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-danger text-[12px] h-8 px-3"
                  >
                    삭제
                  </button>
                  <div className="flex-1" />
                  <button onClick={onClose} className="btn btn-ghost text-[12px] h-8 px-3">취소</button>
                  <button
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    className="btn btn-primary text-[12px] h-8 px-3 disabled:opacity-50"
                  >
                    {saving ? '저장 중…' : '저장'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[12px] text-gray-600">정말 삭제할까요? 되돌릴 수 없어요.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn btn-danger text-[12px] h-8 px-3 disabled:opacity-50 flex-1"
                    >
                      {deleting ? '삭제 중…' : '삭제 확인'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn btn-ghost text-[12px] h-8 px-3"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
