// src/pages/BudgetPage.jsx
export default function BudgetPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-700">예산</p>
        <p className="text-[13px] text-gray-400 mt-1">Phase 7에서 구현됩니다</p>
      </div>
    </div>
  )
}
