import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import TransactionFormModal from '../transactions/TransactionFormModal'
import Modal from '../ui/Modal'
import { LedgerRefreshProvider, useLedgerRefresh } from '../../contexts/LedgerRefreshContext'
import { useAccounts } from '../../hooks/useAccounts'

function AppLayoutInner({ children, title }) {
  const [showModal, setShowModal] = useState(false)
  const [showNoAccountModal, setShowNoAccountModal] = useState(false)
  const { triggerRefresh } = useLedgerRefresh()
  const { accounts, loading: accountsLoading } = useAccounts()
  const navigate = useNavigate()

  function handleAddTransaction() {
    if (!accountsLoading && accounts.length === 0) {
      setShowNoAccountModal(true)
    } else {
      setShowModal(true)
    }
  }

  function handleSuccess() {
    setShowModal(false)
    triggerRefresh()
  }

  function handleGoToAccounts() {
    setShowNoAccountModal(false)
    navigate('/accounts')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onAddTransaction={handleAddTransaction} />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader title={title} />
        <main className="flex-1 min-h-0 flex flex-col">
          {children}
        </main>
      </div>
      <TransactionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
      <Modal isOpen={showNoAccountModal} onClose={() => setShowNoAccountModal(false)}>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-semibold text-gray-900">계좌가 없어요</h2>
            <p className="text-[13px] text-gray-500">거래를 추가하려면 먼저 계좌를 등록해야 해요.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNoAccountModal(false)}
              className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleGoToAccounts}
              className="px-4 py-2 text-[13px] font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              계좌 등록하러 가기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function AppLayout({ children, title }) {
  return (
    <LedgerRefreshProvider>
      <AppLayoutInner title={title}>{children}</AppLayoutInner>
    </LedgerRefreshProvider>
  )
}
