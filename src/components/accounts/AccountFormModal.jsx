import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { useCreateAccount } from '../../hooks/useCreateAccount'
import { useUpdateAccount } from '../../hooks/useUpdateAccount'
import { useAuth } from '../../contexts/AuthContext'
import { ACCOUNT_COLORS } from '../../utils/accountColors'
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS } from '../../utils/accountTypes'
import { useAccounts } from '../../hooks/useAccounts'

const TYPES = ['checking', 'credit_card', 'savings', 'cash']

export default function AccountFormModal({ isOpen, onClose, onCreated, onUpdated, account }) {
  const isEdit = !!account
  const { session } = useAuth()
  const { createAccount, loading: creating } = useCreateAccount()
  const { updateAccount, loading: updating } = useUpdateAccount()
  const loading = isEdit ? updating : creating

  const [name, setName] = useState('')
  const [type, setType] = useState('checking')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])
  const [initialBalance, setInitialBalance] = useState('')
  const [paymentAccountId, setPaymentAccountId] = useState(null)
  const [nameError, setNameError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const { accounts: allAccounts } = useAccounts()
  const nonCardAccounts = allAccounts.filter(a => a.type !== 'credit_card' && a.id !== account?.id)

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setName(account.name)
        setType(account.type)
        setColor(account.color ?? ACCOUNT_COLORS[0])
        const raw = Math.abs(account.initial_balance ?? 0)
        setInitialBalance(raw === 0 ? '' : String(raw))
        setPaymentAccountId(account.payment_account_id ?? null)
      } else {
        setName('')
        setType('checking')
        setColor(ACCOUNT_COLORS[0])
        setInitialBalance('')
        setPaymentAccountId(null)
      }
      setNameError('')
      setSubmitError('')
    }
  }, [isOpen, isEdit, account])

  function handleBalanceInput(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setInitialBalance(raw)
  }

  function formatBalanceDisplay(raw) {
    if (!raw) return ''
    return Number(raw).toLocaleString('ko-KR')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setNameError('')
    setSubmitError('')

    if (!name.trim()) {
      setNameError('계좌명을 입력해주세요.')
      return
    }

    const rawBalance = initialBalance ? Number(initialBalance) : 0
    const finalBalance = type === 'credit_card' ? -rawBalance : rawBalance

    if (isEdit) {
      const result = await updateAccount(account.id, {
        name: name.trim(),
        type,
        color,
        initialBalance: finalBalance,
        paymentAccountId: type === 'credit_card' ? (paymentAccountId ?? null) : null,
      })
      if (result) {
        onUpdated?.()
        onClose()
      } else {
        setSubmitError('계좌를 수정하지 못했습니다. 다시 시도해주세요.')
      }
    } else {
      const result = await createAccount({
        userId: session.user.id,
        name: name.trim(),
        type,
        color,
        initialBalance: finalBalance,
        paymentAccountId: type === 'credit_card' ? (paymentAccountId ?? null) : null,
      })
      if (result) {
        onCreated?.()
        onClose()
      } else {
        setSubmitError('계좌를 저장하지 못했습니다. 다시 시도해주세요.')
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {isEdit ? '계좌 수정' : '계좌 추가'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost px-1.5"
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 바디 */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto">
          {/* 계좌명 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              계좌명
            </label>
            <input
              className={`field w-full ${nameError ? 'border-red-400' : ''}`}
              style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px', fontSize: '13px' }}
              placeholder="예: 카카오뱅크 체크"
              value={name}
              onChange={e => { setName(e.target.value); setNameError('') }}
              autoFocus
            />
            {nameError && (
              <p className="text-[12px] text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          {/* 유형 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              유형
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {TYPES.map(t => {
                const isSelected = type === t
                const c = ACCOUNT_TYPE_COLORS[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`h-8 rounded-lg text-[12px] font-medium border transition-all duration-150
                      ${isSelected
                        ? `${c.bg} ${c.text} ${c.border} border shadow-sm`
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {ACCOUNT_TYPE_LABELS[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 색상 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              색상
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ACCOUNT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-100 hover:scale-110"
                  style={{ backgroundColor: c }}
                  aria-label={c}
                >
                  {color === c && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="white" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 결제 계좌 (신용카드 전용) */}
          {type === 'credit_card' && (
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                결제 계좌
              </label>
              <p className="text-[11px] text-gray-400 mb-1.5">카드값이 빠져나가는 통장을 지정하면 납부 시 자동 선택돼요</p>
              <select
                value={paymentAccountId ?? ''}
                onChange={e => setPaymentAccountId(e.target.value || null)}
                className="field w-full"
                style={{ height: '32px', paddingLeft: '10px', paddingRight: '10px', fontSize: '13px' }}
              >
                <option value="">선택 안 함</option>
                {nonCardAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 초기 잔액 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">
              초기 잔액
            </label>
            <p className="text-[11px] text-gray-400 mb-1.5">
              {type === 'credit_card' ? '현재 미결제 채무액 (부채로 차감됩니다)' : '앱 사용 전 현재 보유 잔액'}
            </p>
            <div className="input-amt w-full" style={{ height: '32px' }}>
              <input
                type="text"
                inputMode="numeric"
                className="flex-1 text-right"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', background: 'transparent', border: 0, outline: 0 }}
                placeholder="0"
                value={formatBalanceDisplay(initialBalance)}
                onChange={handleBalanceInput}
              />
              <span className="text-[12px] text-gray-400 shrink-0">원</span>
            </div>
          </div>

          {submitError && (
            <p className="text-[12px] text-red-500">{submitError}</p>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : null}
            {isEdit ? '수정' : '저장'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
