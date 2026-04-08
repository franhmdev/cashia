// =============================================================================
// HOOKS » useFixedExpenses
// Gestión de estado y CRUD para los gastos fijos de un mes/año dado
// =============================================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

export function useFixedExpenses(month, year) {
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
      const data = await db.fixedExpenses.list(token, month, year)

      // Auto-seed desde plantillas la primera vez que se abre un mes vacío
      // La clave solo se marca cuando ya hay plantillas y se ha sembrado,
      // o cuando el mes ya tiene datos propios. Nunca antes, para permitir
      // que meses visitados sin plantillas se vuelvan a intentar sembrar.
      const seedKey = userId ? `cashia_seeded_${userId}_${year}_${month}` : null
      if (data.length === 0 && seedKey && !localStorage.getItem(seedKey)) {
        const templates = await db.templates.list(token)
        if (templates && templates.length > 0) {
          localStorage.setItem(seedKey, '1')
          const batch = templates.map(t => ({
            user_id:     userId,
            name:        t.name,
            amount:      t.amount,
            due_day:     t.due_day,
            paid:        false,
            month,
            year,
            template_id: t.id,
          }))
          const seeded = await db.fixedExpenses.createBatch(token, batch)
          setItems(seeded ?? [])
          return
        }
        // Sin plantillas: no marcar — se reintentará en la próxima visita
      } else if (data.length > 0 && seedKey) {
        localStorage.setItem(seedKey, '1')
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
    const rows = await db.fixedExpenses.create(token, {
      user_id: userId,
      name,
      amount:  parseFloat(amount),
      due_day: parsedDay >= 1 && parsedDay <= 31 ? parsedDay : null,
      paid:    false,
      month,
      year,
    })
    setItems(prev => [...prev, rows[0]])
  }, [token, userId, month, year])

  const update = useCallback(async (id, payload) => {
    const rows = await db.fixedExpenses.update(token, id, payload)
    setItems(prev => prev.map(i => (i.id === id ? rows[0] : i)))
  }, [token])

  const remove = useCallback(async (id) => {
    await db.fixedExpenses.remove(token, id)
    setItems(prev => prev.filter(i => i.id !== id))
  }, [token])

  const toggle = useCallback(async (id, paid) => {
    const rows = await db.fixedExpenses.update(token, id, { paid })
    setItems(prev => prev.map(i => (i.id === id ? rows[0] : i)))
  }, [token])

  const total   = items.reduce((s, i) => s + Number(i.amount), 0)
  const pending = items.filter(i => !i.paid).reduce((s, i) => s + Number(i.amount), 0)

  return { items, loading, error, add, update, remove, toggle, total, pending }
}
