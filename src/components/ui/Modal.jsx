import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <div
      data-testid="modal-overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-150
        ${isOpen
          ? 'bg-black/40 backdrop-blur-sm pointer-events-auto'
          : 'bg-transparent backdrop-blur-none pointer-events-none'
        }`}
      onClick={onClose}
    >
      <div
        className={`w-[480px] max-w-[90vw] bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]
          transition-all duration-150
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
