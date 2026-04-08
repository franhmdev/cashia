// =============================================================================
// HOOKS » useFixedIncomes
// Gestión de estado y CRUD para los ingresos fijos de un mes/año dado
// =============================================================================
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

export function useFixedIncomes(month, year) {
  const { session }           = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const seededRef = useRef(false)

  const token  = session?.access_token
  const userId = session?.user?.id

  useEffect(() => { seededRef.current = false }, [month, year])

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await db.fixedIncomes.list(token, month, year)

      if (data.length === 0 && !seededRef.current) {
        seededRef.current = true
        const templates = await db.incomeTemplates.list(token)
        if (templates && templates.length > 0) {
          const batch = templates.map(t => ({
            user_id:     userId,
            name:        t.name,
            amount:      t.amount,
            due_day:     t.due_day,
            received:    false,
            month,
            year,
            template_id: t.id,
          }))
          const seeded = await db.fixedIncomes.createBatch(token, batch)
          setItems(seeded ?? [])
          return
        }
      }

      setItems(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token, userId, month, year])

  useEffect(() => { load() }, [load])

  const add = useCallback(async ({ name, amount, due_day }) => {
    const parsedDay = parseInt(due_day, 10)
    const rows = await db.fixedIncomes.create(token, {
      user_id:  userId,
      name,
      amount:   parseFloat(amount),
      due_day:  parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null,
      received: false,
      month,
      year,
    })
    setItems(prev => [...prev, rows[0]])
  }, [token, userId, month, year])

  const update = useCallback(async (id, payload) => {
    const rows = await db.fixedIncomes.update(token, id, payload)
    setItems(prev => prev.map(i => (i.id === id ? rows[0] : i)))
  }, [token])

  const remove = useCallback(async (id) => {
    await db.fixedIncomes.remove(token, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }, [token])

  const toggle = useCallback(async (id, received) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, received } : i)))
    try {
      const rows = await db.fixedIncomes.update(token, id, { received })
      setItems(prev => prev.map(i => (i.id === id ? rows[0] : i)))
    } catch {
      setItems(prev => prev.map(i => (i.id === id ? { ...i, received: !received } : i)))
    }
  }, [token])

  const total   = items.reduce((s, i) => s + Number(i.amount), 0)
  const pending = items.filter(i => !i.received).reduce((s, i) => s + Number(i.amount), 0)

  return { items, loading, error, add, update, remove, toggle, total, pending }
}
