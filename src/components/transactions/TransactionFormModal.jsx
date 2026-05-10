import { useState } from 'react'
import Modal from '../ui/Modal'
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'
import { useCreateTransaction } from '../../hooks/useCreateTransaction'
import { useAuth } from '../../contexts/AuthContext'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function TransactionFormModal({ isOpen, onClose, onSuccess }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [accountId, setAccountId] = useState(null)
  const [date, setDate] = useState(getToday)
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState(null)

  const { session } = useAuth()
  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const { createTransaction, loading } = useCreateTransaction()

  const filteredCategories = categories.filter(
    c => c.type === (type === 'expense' ? 'expense' : 'income')
  )

  const canSubmit = amount && Number(amount) > 0 && categoryId

  function handleClose() {
    setType('expense')
    setAmount('')
    setCategoryId(null)
    setAccountId(null)
    setDate(getToday())
    setNote('')
    setFormError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!canSubmit || loading) return
    setFormError(null)

    const result = await createTransaction({
      userId: session?.user?.id,
      categoryId,
      accountId: accountId ?? null,
      amount: Number(amount),
      type,
      note: note.trim() || null,
      date,
    })

    if (!result) {
      setFormError('거래를 저장하지 못했습니다. 다시 시도해 주세요.')
      return
    }

    onSuccess?.(result)
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-[15px] font-semibold text-gray-900">새 거래 추가</h2>
        <button
          onClick={handleClose}
          aria-label="닫기"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* 에러 */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-[13px] text-red-700">
            {formError}
          </div>
        )}

        {/* 지출 / 수입 토글 */}
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-100">
          <button
            data-type-btn="expense"
            onClick={() => { setType('expense'); setCategoryId(null) }}
            className={`flex-1 h-8 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer
              ${type === 'expense'
                ? 'bg-red-50 text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            지출
          </button>
          <button
            data-type-btn="income"
            onClick={() => { setType('income'); setCategoryId(null) }}
            className={`flex-1 h-8 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer
              ${type === 'income'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            수입
          </button>
        </div>

        {/* 금액 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">금액</label>
          <div className={`flex items-center gap-2 border rounded-lg px-3 h-12 transition-colors duration-150
            ${type === 'expense'
              ? 'border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
              : 'border-blue-200 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'}`}
          >
            <input
              data-testid="amount-input"
              type="text"
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
              onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              className={`flex-1 min-w-0 bg-transparent outline-none text-right font-mono text-[24px] font-bold
                placeholder:text-gray-300
                ${type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}
            />
            <span className="text-[13px] text-gray-400 shrink-0">원</span>
          </div>
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">카테고리</label>
          <div data-testid="category-grid" className="grid grid-cols-4 gap-2">
            {filteredCategories.length === 0 ? (
              <div className="col-span-4 py-6 text-center text-[12px] text-gray-400">
                카테고리를 불러오는 중...
              </div>
            ) : (
              filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border
                    transition-all duration-150 cursor-pointer min-h-[60px]
                    ${categoryId === cat.id
                      ? 'bg-indigo-50 border-indigo-500 border-[1.5px]'
                      : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className="text-[20px] leading-none">{cat.icon}</span>
                  <span className={`text-[11px] font-medium leading-tight text-center line-clamp-1
                    ${categoryId === cat.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">날짜</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="field w-full cursor-pointer"
          />
        </div>

        {/* 계좌 */}
        {accounts.length > 0 && (
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">계좌 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => setAccountId(accountId === acc.id ? null : acc.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                    text-[12px] font-medium transition-all duration-150 cursor-pointer
                    ${accountId === acc.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span
                    className="w-2 h-2 rounded-[2px] shrink-0"
                    style={{ backgroundColor: acc.color ?? '#6b7280' }}
                  />
                  {acc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 메모 */}
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">메모 (선택)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="간단한 메모를 입력하세요"
            className="field w-full"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 shrink-0">
        <button className="btn btn-ghost" onClick={handleClose}>취소</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              저장 중...
            </span>
          ) : '저장'}
        </button>
      </div>
    </Modal>
  )
}
