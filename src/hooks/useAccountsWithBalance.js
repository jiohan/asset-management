import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAccountsWithBalance(refreshKey = 0) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const [
        { data: accountsData, error: accountsError },
        { data: txData, error: txError },
        { data: trData, error: trError },
      ] = await Promise.all([
        supabase
          .from('accounts')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('transactions')
          .select('account_id, type, amount'),
        supabase
          .from('transfers')
          .select('from_account_id, to_account_id, amount'),
      ])

      setLoading(false)

      if (accountsError || txError || trError) {
        setError('계좌 잔액을 불러오지 못했습니다.')
        return
      }

      const withBalance = accountsData.map((account) => {
        const income = txData
          .filter((t) => t.account_id === account.id && t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)

        const expense = txData
          .filter((t) => t.account_id === account.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        const transferIn = trData
          .filter((t) => t.to_account_id === account.id)
          .reduce((sum, t) => sum + t.amount, 0)

        const transferOut = trData
          .filter((t) => t.from_account_id === account.id)
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          ...account,
          balance: account.initial_balance + income - expense + transferIn - transferOut,
        }
      })

      setAccounts(withBalance)
    }

    load()
  }, [refreshKey])

  return { accounts, loading, error }
}
