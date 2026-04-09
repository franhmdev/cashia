// =============================================================================
// HOOKS » useExtraExpenses
// CRUD de gastos extras por mes/año — sin auto-seed ni toggle
// =============================================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

export function useExtraExpenses(month, year) {
  const { session }           = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const token  = session?.access_token
  const userId = session?.user?.id

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await db.extraExpenses.list(token, month, year)
      setItems(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token, month, year])

  useEffect(() => { load() }, [load])

  const add = useCallback(async ({ name, amount, due_day, category_id }) => {
    const parsedDay = parseInt(due_day, 10)
    const rows = await db.extraExpenses.create(token, {
      user_id:     userId,
      name,
      amount:      parseFloat(amount),
      due_day:     parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null,
      category_id: category_id || null,
      month,
      year,
    })
    setItems(prev => [...prev, rows[0]])
  }, [token, userId, month, year])

  const update = useCallback(async (id, payload) => {
    const rows = await db.extraExpenses.update(token, id, payload)
    setItems(prev => prev.map(i => (i.id === id ? rows[0] : i)))
  }, [token])

  const remove = useCallback(async (id) => {
    await db.extraExpenses.remove(token, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }, [token])

  const total = items.reduce((s, i) => s + Number(i.amount), 0)

  return { items, loading, error, add, update, remove, total }
}
