// src/pages/LedgerPage.jsx
export default function LedgerPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-700">거래 내역</p>
        <p className="text-[13px] text-gray-400 mt-1">Phase 5에서 구현됩니다</p>
      </div>
    </div>
  )
}
