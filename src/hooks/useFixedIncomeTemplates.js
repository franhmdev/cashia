// =============================================================================
// HOOKS » useFixedIncomeTemplates
// CRUD de plantillas de ingresos por defecto + propagación a meses futuros
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

export function useFixedIncomeTemplates() {
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
      const data = await db.incomeTemplates.list(token)
      setTemplates(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const add = useCallback(async ({ name, amount, due_day }) => {
    const rows = await db.incomeTemplates.create(token, {
      user_id: userId,
      name,
      amount:  parseFloat(amount),
      due_day: parseDay(due_day),
    })
    const tpl = rows[0]
    setTemplates(prev => [...prev, tpl])

    try {
      const { month, year } = nowMonthYear()
      const allFuture = await db.fixedIncomes.listFutureMonths(token, month, year)
      if (allFuture && allFuture.length > 0) {
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
          received:    false,
          month:       r.month,
          year:        r.year,
          template_id: tpl.id,
        }))
        await db.fixedIncomes.createBatch(token, batch)
      }
    } catch (_) {}

    return tpl
  }, [token, userId])

  const update = useCallback(async (id, { name, amount, due_day }) => {
    const payload = { name, amount: parseFloat(amount), due_day: parseDay(due_day) }
    const rows = await db.incomeTemplates.update(token, id, payload)
    setTemplates(prev => prev.map(t => (t.id === id ? rows[0] : t)))

    try {
      const { month, year } = nowMonthYear()
      await db.fixedIncomes.updateByTemplate(token, id, payload, month, year)
    } catch (_) {}
  }, [token])

  const remove = useCallback(async (id) => {
    await db.incomeTemplates.remove(token, id)
    setTemplates(prev => prev.filter(t => t.id !== id))

    try {
      const { month, year } = nowMonthYear()
      await db.fixedIncomes.removeByTemplate(token, id, month, year)
    } catch (_) {}
  }, [token])

  return { templates, loading, error, add, update, remove, reload: load }
}
