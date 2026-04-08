// =============================================================================
// HOOKS » useFixedExpenseTemplates
// CRUD de plantillas por defecto + propagación a meses futuros
// =============================================================================
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/supabase'

function nowMonthYear() {
  const d = new Date()
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}

function parseDay(val) {
  const n = parseInt(val, 10)
  return n >= 1 && n <= 31 ? n : null
}

export function useFixedExpenseTemplates() {
  const { session }               = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const token  = session?.access_token
  const userId = session?.user?.id

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await db.templates.list(token)
      setTemplates(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  // ── Añadir plantilla ────────────────────────────────────────────────────────
  const add = useCallback(async ({ name, amount, due_day }) => {
    const rows = await db.templates.create(token, {
      user_id: userId,
      name,
      amount:  parseFloat(amount),
      due_day: parseDay(due_day),
    })
    const tpl = rows[0]
    setTemplates(prev => [...prev, tpl])

    // Propagar a meses futuros que ya tengan datos (ya visitados y con seed)
    try {
      const { month, year } = nowMonthYear()
      const allFuture = await db.fixedExpenses.listFutureMonths(token, month, year)
      if (allFuture && allFuture.length > 0) {
        // Deduplicar pares mes/año
        const seen = new Set()
        const uniqueMonths = allFuture.filter(r => {
          const key = `${r.year}-${r.month}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        const batch = uniqueMonths.map(r => ({
          user_id:     userId,
          name:        tpl.name,
          amount:      tpl.amount,
          due_day:     tpl.due_day,
          paid:        false,
          month:       r.month,
          year:        r.year,
          template_id: tpl.id,
        }))
        await db.fixedExpenses.createBatch(token, batch)
      }
    } catch (_) { /* Propagación de bajo impacto */ }

    return tpl
  }, [token, userId])

  // ── Editar plantilla ────────────────────────────────────────────────────────
  const update = useCallback(async (id, { name, amount, due_day }) => {
    const payload = { name, amount: parseFloat(amount), due_day: parseDay(due_day) }
    const rows = await db.templates.update(token, id, payload)
    setTemplates(prev => prev.map(t => (t.id === id ? rows[0] : t)))

    // Propagar campos a meses futuros con template_id coincidente
    try {
      const { month, year } = nowMonthYear()
      await db.fixedExpenses.updateByTemplate(token, id, payload, month, year)
    } catch (_) {}
  }, [token])

  // ── Eliminar plantilla ──────────────────────────────────────────────────────
  const remove = useCallback(async (id) => {
    await db.templates.remove(token, id)
    setTemplates(prev => prev.filter(t => t.id !== id))

    try {
      const { month, year } = nowMonthYear()
      await db.fixedExpenses.removeByTemplate(token, id, month, year)
    } catch (_) {}
  }, [token])

  return { templates, loading, error, add, update, remove, reload: load }
}
