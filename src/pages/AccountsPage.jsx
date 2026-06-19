import { useMemo, useState } from 'react'
import { useAccountsWithBalance } from '../hooks/useAccountsWithBalance'
import { useDeleteAccount } from '../hooks/useDeleteAccount'
import { useLedgerRefresh } from '../contexts/LedgerRefreshContext'
import { ACCOUNT_TYPE_LABELS } from '../utils/accountTypes'
import AccountFormModal from '../components/accounts/AccountFormModal'
import AccountDetailPanel from '../components/accounts/AccountDetailPanel'
import { supabase } from '../lib/supabase'

function formatAmount(n) {
  return Math.abs(n).toLocaleString('ko-KR')
}

export default function AccountsPage() {
  const [localRefreshKey, setLocalRefreshKey] = useState(0)
  const { refreshKey: globalRefreshKey } = useLedgerRefresh()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBlocked, setDeleteBlocked] = useState(false)
  const [deleteBlockMsg, setDeleteBlockMsg] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { accounts, loading, error } = useAccountsWithBalance(localRefreshKey + globalRefreshKey)
  const { deleteAccount } = useDeleteAccount()

  const { totalAssets, totalLiabilities, netWorth } = useMemo(() => {
    const assets = accounts
      .filter(a => a.type !== 'credit_card')
      .reduce((s, a) => s + a.balance, 0)
    const liabilities = accounts
      .filter(a => a.type === 'credit_card')
      .reduce((s, a) => s + a.balance, 0)
    return { totalAssets: assets, totalLiabilities: liabilities, netWorth: assets + liabilities }
  }, [accounts])

  function handleCreated() {
    setLocalRefreshKey(k => k + 1)
  }

  function handleUpdated() {
    setLocalRefreshKey(k => k + 1)
    // Keep the selected panel in sync by refreshing the accounts list
    setSelectedAccount(null)
  }

  async function handleDeleteClick(account) {
    // Check for connected transactions
    const [{ count: txCount }, { count: trCount }] = await Promise.all([
      supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('account_id', account.id),
      supabase.from('transfers').select('*', { count: 'exact', head: true }).or(`from_account_id.eq.${account.id},to_account_id.eq.${account.id}`),
    ])
    const total = (txCount ?? 0) + (trCount ?? 0)
    if (total > 0) {
      setDeleteTarget(account)
      setDeleteBlocked(true)
      setDeleteBlockMsg(`이 계좌에 연결된 거래·이체가 ${total}건 있어 삭제할 수 없습니다. 먼저 해당 거래를 삭제하거나 다른 계좌로 변경해 주세요.`)
    } else {
      setDeleteTarget(account)
      setDeleteBlocked(false)
      setDeleteBlockMsg('')
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget || deleteLoading) return
    setDeleteLoading(true)
    const ok = await deleteAccount(deleteTarget.id)
    setDeleteLoading(false)
    if (ok) {
      setDeleteTarget(null)
      setSelectedAccount(null)
      setLocalRefreshKey(k => k + 1)
    }
  }

  // Sync selectedAccount with fresh data after refresh
  const selectedAccountFresh = selectedAccount
    ? accounts.find(a => a.id === selectedAccount.id) ?? selectedAccount
    : null

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 relative">
      {/* 순자산 헤더 카드 */}
      <div className="card mb-6">
        <div className="card-h">
          <h3>순자산 현황</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="px-6 py-5">
            <p className="text-[12px] font-medium text-gray-500 mb-1.5">총 자산</p>
            <p className="mono text-[24px] font-bold text-blue-500 leading-none">
              {loading ? '—' : formatAmount(totalAssets)}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">원</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[12px] font-medium text-gray-500 mb-1.5">총 부채</p>
            <p className={`mono text-[24px] font-bold leading-none ${totalLiabilities < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {loading ? '—' : (totalLiabilities < 0 ? `−${formatAmount(totalLiabilities)}` : formatAmount(totalLiabilities))}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">원</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-[12px] font-medium text-gray-500 mb-1.5">순자산</p>
            <p className={`mono text-[24px] font-bold leading-none ${netWorth < 0 ? 'text-red-500' : 'text-gray-900'}`}>
              {loading ? '—' : (netWorth < 0 ? `−${formatAmount(netWorth)}` : formatAmount(netWorth))}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">원</p>
          </div>
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-gray-500">
          {!loading && `내 계좌 ${accounts.length}개`}
        </p>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          계좌 추가
        </button>
      </div>

      {error && (
        <p className="text-[13px] text-red-500 mb-4">{error}</p>
      )}

      {/* 계좌 카드 그리드 / 빈 상태 */}
      {!loading && accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="13" rx="2"/>
              <path d="M3 10h18"/>
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-gray-700 mb-1">계좌가 없어요</p>
          <p className="text-[13px] text-gray-400 mb-4">계좌를 추가해 잔액을 관리해보세요</p>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            계좌 추가
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={selectedAccount?.id === account.id}
              onCardClick={() => setSelectedAccount(account)}
              onEditClick={e => { e.stopPropagation(); setEditingAccount(account) }}
              onDeleteClick={e => { e.stopPropagation(); handleDeleteClick(account) }}
            />
          ))}
        </div>
      )}

      {/* 계좌 생성 모달 */}
      <AccountFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />

      {/* 계좌 편집 모달 */}
      <AccountFormModal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        account={editingAccount}
        onUpdated={handleUpdated}
      />

      {/* 삭제 확인 다이얼로그 */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl p-6 w-80 pointer-events-auto">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
                {deleteBlocked ? '삭제 불가' : `'${deleteTarget.name}' 삭제`}
              </h3>
              {deleteBlocked ? (
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">{deleteBlockMsg}</p>
              ) : (
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                  계좌를 삭제하면 목록에서 사라집니다. 되돌릴 수 없어요.
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  className="btn btn-ghost"
                  onClick={() => setDeleteTarget(null)}
                >
                  {deleteBlocked ? '확인' : '취소'}
                </button>
                {!deleteBlocked && (
                  <button
                    className="btn btn-danger"
                    disabled={deleteLoading}
                    onClick={handleDeleteConfirm}
                  >
                    {deleteLoading ? '삭제 중…' : '삭제'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 계좌 상세 패널 */}
      <AccountDetailPanel
        account={selectedAccountFresh}
        onClose={() => setSelectedAccount(null)}
        onEdit={() => {
          setEditingAccount(selectedAccountFresh)
          setSelectedAccount(null)
        }}
        onDelete={() => {
          handleDeleteClick(selectedAccountFresh)
          setSelectedAccount(null)
        }}
      />
    </div>
  )
}

function AccountCard({ account, isSelected, onCardClick, onEditClick, onDeleteClick }) {
  const isNegative = account.balance < 0
  const typeLabel = ACCOUNT_TYPE_LABELS[account.type] ?? account.type

  return (
    <div
      className={`card cursor-pointer transition-shadow duration-150 overflow-hidden group ${
        isSelected ? 'ring-2 ring-indigo-400 shadow-md' : 'hover:shadow-md'
      }`}
      onClick={onCardClick}
    >
      <div className="h-1.5" style={{ backgroundColor: account.color }} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ backgroundColor: account.color }}
          />
          <span className="text-[14px] font-semibold text-gray-900 truncate flex-1">
            {account.name}
          </span>
          <span className="pill idle shrink-0">{typeLabel}</span>
          {/* 편집/삭제 버튼 — hover 시 표시 */}
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={onEditClick}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-100"
              title="편집"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7.5 1.5l2 2L2 11H0V9L7.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={onDeleteClick}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-100"
              title="삭제"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 2.5h9M4 2.5V1.5h3v1M3 2.5v6h5v-6H3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`mono text-[22px] font-bold leading-none ${isNegative ? 'text-red-500' : 'text-gray-900'}`}>
            {isNegative ? `−${formatAmount(account.balance)}` : formatAmount(account.balance)}
          </span>
          <span className="text-[13px] text-gray-400">원</span>
        </div>
      </div>
    </div>
  )
}
