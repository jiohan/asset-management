// src/components/layout/AppHeader.jsx
export default function AppHeader({ title }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center shrink-0">
      <h1 className="text-[15px] font-semibold text-gray-900">{title}</h1>
    </header>
  )
}
