// =============================================================================
// HOOKS » useLoans
// CRUD global de préstamos del usuario (no dependen del mes)
// =============================================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

export function useLoans() {
  const { session }         = useAuth()
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const token  = session?.access_token
  const userId = session?.user?.id

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await db.loans.list(token)
      setItems(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const add = useCallback(async ({ title, amount, monthly_payment }) => {
    const rows = await db.loans.create(token, {
      user_id: userId,
      title,
      amount:          parseFloat(amount),
      monthly_payment: parseFloat(monthly_payment),
    })
    setItems(prev => [...prev, rows[0]])
  }, [token, userId])

  const update = useCallback(async (id, payload) => {
    const rows = await db.loans.update(token, id, payload)
    setItems(prev => prev.map(i => (i.id === id ? rows[0] : i)))
  }, [token])

  const remove = useCallback(async (id) => {
    await db.loans.remove(token, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }, [token])

  const totalAmount  = items.reduce((s, i) => s + Number(i.amount), 0)
  const totalMonthly = items.reduce((s, i) => s + Number(i.monthly_payment), 0)

  return { items, loading, error, add, update, remove, totalAmount, totalMonthly }
}
