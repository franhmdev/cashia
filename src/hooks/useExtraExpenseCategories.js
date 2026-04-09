// =============================================================================
// HOOKS » useExtraExpenseCategories
// CRUD global de categorías de gastos extras (no dependen del mes)
// =============================================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

export function useExtraExpenseCategories() {
  const { session }               = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const token  = session?.access_token
  const userId = session?.user?.id

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await db.extraExpenseCategories.list(token)
      setCategories(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const add = useCallback(async ({ name, color }) => {
    const rows = await db.extraExpenseCategories.create(token, { user_id: userId, name, color })
    setCategories(prev => [...prev, rows[0]])
    return rows[0]
  }, [token, userId])

  const update = useCallback(async (id, payload) => {
    const rows = await db.extraExpenseCategories.update(token, id, payload)
    setCategories(prev => prev.map(c => (c.id === id ? rows[0] : c)))
  }, [token])

  const remove = useCallback(async (id) => {
    await db.extraExpenseCategories.remove(token, id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [token])

  return { categories, loading, error, add, update, remove }
}
