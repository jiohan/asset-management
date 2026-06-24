import { useEffect, useState, useMemo } from 'react'
import Modal from '../ui/Modal'
import { useUpsertBudget } from '../../hooks/useUpsertBudget'
import { useDeleteCategoryBudget } from '../../hooks/useDeleteCategoryBudget'
import { useCategories } from '../../hooks/useCategories'

export default function CategoryBudgetModal({
  isOpen,
  onClose,
  mode,           // 'add' | 'edit'
  budgetEntry,    // null in add mode; { id, categoryId, amount, categoryName, categoryIcon } in edit mode
  month,
  budgetedCategoryIds,  // Set<string>
  onSaved,
  onDeleted,
}) {
  const isEdit = mode === 'edit'
  const { categories } = useCategories()
  const { upsertBudget, loading: saving } = useUpsertBudget()
  const { deleteCategoryBudget, loading: deleting } = useDeleteCategoryBudget()

  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSubmitError('')
      if (isEdit && budgetEntry) {
        setSelectedCategoryId(budgetEntry.categoryId)
        setAmount(String(budgetEntry.amount))
      } else {
        setSelectedCategoryId('')
        setAmount('')
      }
    }
  }, [isOpen, isEdit, budgetEntry])

  const expenseCategories = useMemo(
    () => categories.filter(c => c.type === 'expense' && !budgetedCategoryIds.has(c.id)),
    [categories, budgetedCategoryIds]
  )

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
    if (!isEdit && !selectedCategoryId) {
      setSubmitError('카테고리를 선택해주세요.')
      return
    }
    const catId = isEdit ? budgetEntry.categoryId : selectedCategoryId
    const result = await upsertBudget({ categoryId: catId, amount: Number(amount) || 0, month })
    if (!result) {
      setSubmitError('저장하지 못했습니다. 다시 시도해주세요.')
      return
    }
    onSaved?.()
    onClose()
  }

  async function handleDelete() {
    if (!budgetEntry?.id) return
    const ok = await deleteCategoryBudget({ id: budgetEntry.id })
    if (!ok) {
      setSubmitError('삭제하지 못했습니다. 다시 시도해주세요.')
      return
    }
    onDeleted?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">
            {isEdit ? '카테고리 예산 수정' : '카테고리 예산 추가'}
          </h2>
          <button type="button" onClick={onClose} className="btn btn-ghost px-1.5" aria-label="닫기">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 바디 */}
        <div className="px-5 py-5 space-y-4">
          {/* 카테고리 */}
          {isEdit ? (
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">카테고리</label>
              <div className="bg-gray-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <span className="text-[18px]">{budgetEntry?.categoryIcon}</span>
                <span className="text-[13px] font-medium text-gray-800">{budgetEntry?.categoryName}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">카테고리</label>
              <div className="field w-full" style={{ height: '36px' }}>
                <select
                  autoFocus
                  className="flex-1 bg-transparent border-0 outline-0 text-[13px] text-gray-700"
                  value={selectedCategoryId}
                  onChange={e => setSelectedCategoryId(e.target.value)}
                >
                  <option value="">카테고리 선택...</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 예산 금액 */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">예산 금액</label>
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
                autoFocus={isEdit}
              />
              <span className="text-[13px] text-gray-400 shrink-0">원</span>
            </div>
          </div>

          {submitError && <p className="text-[12px] text-red-500">{submitError}</p>}
        </div>

        {/* 푸터 */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100">
          {/* 삭제 버튼: 영속화된 항목에만 표시 (id가 null이 아닐 때) */}
          {isEdit && budgetEntry?.id != null && (
            <button
              type="button"
              className="btn btn-ghost btn-danger mr-auto"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">취소</button>
            <button type="submit" className="btn btn-primary" disabled={saving || deleting}>
              {saving && (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              저장
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
