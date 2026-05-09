import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<PrivateRoute><PlaceholderPage title="대시보드" /></PrivateRoute>} />
          <Route path="/ledger" element={<PrivateRoute><PlaceholderPage title="거래 내역" /></PrivateRoute>} />
          <Route path="/budget" element={<PrivateRoute><PlaceholderPage title="예산" /></PrivateRoute>} />
          <Route path="/accounts" element={<PrivateRoute><PlaceholderPage title="계좌" /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function PrivateRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return children
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
