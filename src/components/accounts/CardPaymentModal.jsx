import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { useAccounts } from '../../hooks/useAccounts'
import { useCreateTransfer } from '../../hooks/useCreateTransfer'
import { useAuth } from '../../contexts/AuthContext'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function CardPaymentModal({ isOpen, cardAccount, onClose, onSuccess }) {
  const { session } = useAuth()
  const { accounts } = useAccounts()
  const { createTransfer, loading } = useCreateTransfer()

  const [fromAccountId, setFromAccountId] = useState(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getToday)
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState(null)

  const nonCardAccounts = accounts.filter(a => a.type !== 'credit_card' && a.id !== cardAccount?.id)

  useEffect(() => {
    if (isOpen && cardAccount) {
      const debtAmt = Math.abs(cardAccount.balance)
      setAmount(debtAmt > 0 ? String(debtAmt) : '')
      setDate(getToday())
      setNote('')
      setFormError(null)
      // 결제 계좌 자동선택: payment_account_id 우선, 없으면 첫 번째 계좌
      const defaultId = cardAccount.payment_account_id
        ?? nonCardAccounts[0]?.id
        ?? null
      setFromAccountId(defaultId)
    }
  }, [isOpen, cardAccount])

  function handleAmountInput(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setAmount(raw)
  }

  function formatDisplay(raw) {
    if (!raw) return ''
    return Number(raw).toLocaleString('ko-KR')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    const amt = Number(amount)
    if (!amt || amt <= 0) { setFormError('금액을 입력해주세요.'); return }
    if (!fromAccountId) { setFormError('출금 계좌를 선택해주세요.'); return }
    if (fromAccountId === cardAccount?.id) { setFormError('출금 계좌와 카드 계좌가 같을 수 없습니다.'); return }

    const result = await createTransfer({
      userId: session?.user?.id,
      fromAccountId,
      toAccountId: cardAccount.id,
      amount: amt,
      date,
      note: note.trim() || null,
      type: 'card_payment',
    })

    if (!result) {
      setFormError('납부 기록에 실패했습니다. 다시 시도해주세요.')
      return
    }

    onSuccess?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">대금 납부</h2>
            {cardAccount && (
              <p className="text-[12px] text-gray-400 mt-0.5">{cardAccount.name}</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost px-1.5" aria-label="닫기">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 바디 */}
        <div className="px-5 py-4 space-y-4">
          {/* 현재 미결제 */}
          {cardAccount && (
            <div className="bg-red-50 rounded-lg px-4 py-3">
              <p className="text-[11px] text-red-400">현재 미결제 잔액</p>
              <p className="mono text-[20px] font-bold text-red-500 leading-tight">
                {Math.abs(cardAccount.balance).toLocaleString('ko-KR')}원
              </p>
            </div>
          )}

          {/* 출금 계좌 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">출금 계좌</label>
            <select
              value={fromAccountId ?? ''}
              onChange={e => setFromAccountId(e.target.value || null)}
              className="field w-full"
              style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px', fontSize: '13px' }}
            >
              <option value="">계좌 선택</option>
              {nonCardAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* 납부 금액 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">납부 금액</label>
            <p className="text-[11px] text-gray-400 mb-1.5">미결제 금액이 자동 입력됩니다. 수정 가능해요.</p>
            <div className="input-amt w-full" style={{ height: '32px' }}>
              <input
                type="text"
                inputMode="numeric"
                className="flex-1 text-right"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', background: 'transparent', border: 0, outline: 0 }}
                placeholder="0"
                value={formatDisplay(amount)}
                onChange={handleAmountInput}
              />
              <span className="text-[12px] text-gray-400 shrink-0">원</span>
            </div>
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">날짜</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="field w-full"
              style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px', fontSize: '13px' }}
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">메모 (선택)</label>
            <input
              type="text"
              className="field w-full"
              style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px', fontSize: '13px' }}
              placeholder="예: 6월 카드 대금"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {formError && (
            <p className="text-[12px] text-red-500">{formError}</p>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-ghost">취소</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : null}
            납부하기
          </button>
        </div>
      </form>
    </Modal>
  )
}
