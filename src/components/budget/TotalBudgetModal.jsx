import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useUpsertBudget } from '../../hooks/useUpsertBudget'

export default function TotalBudgetModal({ isOpen, onClose, month, initialAmount = 0, onSaved }) {
  const [amount, setAmount] = useState('')
  const [submitError, setSubmitError] = useState('')
  const { upsertBudget, loading } = useUpsertBudget()

  useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount > 0 ? String(initialAmount) : '')
      setSubmitError('')
    }
  }, [isOpen, initialAmount])

  function handleAmountInput(e) {
    setAmount(e.target.value.replace(/[^0-9]/g, ''))
  }

  function formatDisplay(raw) {
    if (!raw) return ''
    return Number(raw).toLocaleString('ko-KR')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const result = await upsertBudget({ categoryId: null, amount: Number(amount) || 0, month })
    if (!result) {
      setSubmitError('저장하지 못했습니다. 다시 시도해주세요.')
      return
    }
    onSaved?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">이번 달 예산 설정</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost px-1.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">월 전체 예산</label>
            <div className="input-amt w-full" style={{ height: '44px' }}>
              <input
                type="text"
                inputMode="numeric"
                className="flex-1 text-right"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '18px',
                  fontWeight: 700,
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                }}
                placeholder="0"
                value={formatDisplay(amount)}
                onChange={handleAmountInput}
                autoFocus
              />
              <span className="text-[13px] text-gray-400 shrink-0">원</span>
            </div>
          </div>
          {submitError && <p className="text-[12px] text-red-500">{submitError}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-ghost">취소</button>
          <button type="submit" className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            저장
          </button>
        </div>
      </form>
    </Modal>
  )
}
