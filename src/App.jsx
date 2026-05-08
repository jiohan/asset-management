import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PlaceholderPage title="대시보드" />} />
        <Route path="/ledger" element={<PlaceholderPage title="거래 내역" />} />
        <Route path="/budget" element={<PlaceholderPage title="예산" />} />
        <Route path="/accounts" element={<PlaceholderPage title="계좌" />} />
      </Routes>
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <span className="text-xl text-white">M</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Monimo</h1>
        <p className="mt-2 text-gray-500">{title} 페이지 — Phase 1 설정 완료</p>
      </div>
    </div>
  )
}

export default App
