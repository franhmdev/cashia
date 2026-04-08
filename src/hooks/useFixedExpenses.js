// =============================================================================
// HOOKS » useFixedExpenses
// Gestión de estado y CRUD para los gastos fijos de un mes/año dado
// =============================================================================
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

export function useFixedExpenses(month, year) {
  const { session }           = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  // Evita doble-seed dentro de la misma sesión de página para el mes actual
  const seededRef = useRef(false)

  const token  = session?.access_token
  const userId = session?.user?.id

  // Resetear el guard cuando cambia de mes para permitir seed en el nuevo mes
  useEffect(() => { seededRef.current = false }, [month, year])

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await db.fixedExpenses.list(token, month, year)

      // Auto-seed: si el mes está vacío y no se ha sembrado en esta sesión,
      // cargar las plantillas por defecto del usuario.
      // No usa localStorage para que meses futuros no visitados funcionen
      // aunque el usuario haya visitado el mes antes de crear plantillas.
      if (data.length === 0 && !seededRef.current) {
        seededRef.current = true  // marcar antes del fetch para evitar doble llamada
        const templates = await db.templates.list(token)
        if (templates && templates.length > 0) {
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
