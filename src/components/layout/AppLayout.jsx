// src/components/layout/AppLayout.jsx
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'

export default function AppLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader title={title} />
        <main className="flex-1 min-h-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
