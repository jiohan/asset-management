import { createContext, useContext, useState, useCallback } from 'react'

const LedgerRefreshContext = createContext(null)

export function LedgerRefreshProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <LedgerRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </LedgerRefreshContext.Provider>
  )
}

export function useLedgerRefresh() {
  const ctx = useContext(LedgerRefreshContext)
  if (!ctx) throw new Error('useLedgerRefresh must be used inside LedgerRefreshProvider')
  return ctx
}
