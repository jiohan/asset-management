// src/components/layout/AppLayout.jsx
import { useState } from 'react'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import TransactionFormModal from '../transactions/TransactionFormModal'

export default function AppLayout({ children, title }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onAddTransaction={() => setShowModal(true)} />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader title={title} />
        <main className="flex-1 min-h-0 flex flex-col">
          {children}
        </main>
      </div>
      <TransactionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setShowModal(false)}
      />
    </div>
  )
}
