// =============================================================================
// LIB » Supabase — cliente REST sin SDK
// Usa la Auth API v2 de Supabase directamente con fetch
// =============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const BASE_HEADERS = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
}

async function authRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    ...options,
    headers: { ...BASE_HEADERS, ...options.headers },
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) {
    const msg =
      data.error_description ||
      data.msg ||
      data.message ||
      data.error ||
      'Error de autenticación'
    throw new Error(msg)
  }
  return data
}

export function signIn(email, password) {
  return authRequest('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function signUp(email, password, name) {
  return authRequest('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, data: { name } }),
  })
}

export function signOut(accessToken) {
  return authRequest('/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export function refreshToken(token) {
  return authRequest('/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: token }),
  })
}

// =============================================================================
// DB » REST API — cliente para tablas de Supabase
// =============================================================================

async function dbRequest(path, { token, method = 'GET', body, prefer } = {}) {
  const headers = {
    ...BASE_HEADERS,
    Authorization: `Bearer ${token}`,
    // Representación de vuelta por defecto en escrituras; vacío para DELETE
    Prefer: prefer !== undefined ? prefer : (method !== 'GET' && method !== 'DELETE' ? 'return=representation' : ''),
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`)
  }
  return data
}

export const db = {
  fixedExpenses: {
    list: (token, month, year) =>
      dbRequest(
        `/fixed_expenses?month=eq.${month}&year=eq.${year}&order=due_day.asc.nullslast,created_at.asc`,
        { token }
      ),
    create: (token, payload) =>
      dbRequest('/fixed_expenses', { token, method: 'POST', body: payload }),
    createBatch: (token, payloads) =>
      dbRequest('/fixed_expenses', { token, method: 'POST', body: payloads }),
    update: (token, id, payload) =>
      dbRequest(`/fixed_expenses?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/fixed_expenses?id=eq.${id}`, { token, method: 'DELETE' }),
    // Propagar cambios de plantilla a meses futuros (dos queries simples en lugar de OR anidado)
    updateByTemplate: (token, templateId, payload, afterMonth, afterYear) =>
      Promise.all([
        // años estrictamente posteriores
        dbRequest(`/fixed_expenses?template_id=eq.${templateId}&year=gt.${afterYear}`, { token, method: 'PATCH', body: payload }),
        // mismo año, meses estrictamente posteriores
        dbRequest(`/fixed_expenses?template_id=eq.${templateId}&year=eq.${afterYear}&month=gt.${afterMonth}`, { token, method: 'PATCH', body: payload }),
      ]),
    removeByTemplate: (token, templateId, afterMonth, afterYear) =>
      Promise.all([
        dbRequest(`/fixed_expenses?template_id=eq.${templateId}&year=gt.${afterYear}`, { token, method: 'DELETE' }),
        dbRequest(`/fixed_expenses?template_id=eq.${templateId}&year=eq.${afterYear}&month=gt.${afterMonth}`, { token, method: 'DELETE' }),
      ]),
    // Verificar si un mes ya fue inicializado
    countForMonth: (token, month, year) =>
      dbRequest(
        `/fixed_expenses?month=eq.${month}&year=eq.${year}&select=id`,
        { token }
      ),
    // Obtener pares mes/año futuros que ya tienen datos (para propagar nuevas plantillas)
    listFutureMonths: (token, afterMonth, afterYear) =>
      Promise.all([
        dbRequest(`/fixed_expenses?year=gt.${afterYear}&select=month,year`, { token }),
        dbRequest(`/fixed_expenses?year=eq.${afterYear}&month=gt.${afterMonth}&select=month,year`, { token }),
      ]).then(([a, b]) => [...(a ?? []), ...(b ?? [])]),
  },

  templates: {
    list: (token) =>
      dbRequest(
        `/fixed_expense_templates?order=due_day.asc.nullslast,created_at.asc`,
        { token }
      ),
    create: (token, payload) =>
      dbRequest('/fixed_expense_templates', { token, method: 'POST', body: payload }),
    update: (token, id, payload) =>
      dbRequest(`/fixed_expense_templates?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/fixed_expense_templates?id=eq.${id}`, { token, method: 'DELETE' }),
  },

  // ── Ingresos fijos ────────────────────────────────────────────────────────
  fixedIncomes: {
    list: (token, month, year) =>
      dbRequest(
        `/fixed_incomes?month=eq.${month}&year=eq.${year}&order=due_day.asc.nullslast,created_at.asc`,
        { token }
      ),
    create: (token, payload) =>
      dbRequest('/fixed_incomes', { token, method: 'POST', body: payload }),
    createBatch: (token, payloads) =>
      dbRequest('/fixed_incomes', { token, method: 'POST', body: payloads }),
    update: (token, id, payload) =>
      dbRequest(`/fixed_incomes?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/fixed_incomes?id=eq.${id}`, { token, method: 'DELETE' }),
    updateByTemplate: (token, templateId, payload, afterMonth, afterYear) =>
      Promise.all([
        dbRequest(`/fixed_incomes?template_id=eq.${templateId}&year=gt.${afterYear}`, { token, method: 'PATCH', body: payload }),
        dbRequest(`/fixed_incomes?template_id=eq.${templateId}&year=eq.${afterYear}&month=gt.${afterMonth}`, { token, method: 'PATCH', body: payload }),
      ]),
    removeByTemplate: (token, templateId, afterMonth, afterYear) =>
      Promise.all([
        dbRequest(`/fixed_incomes?template_id=eq.${templateId}&year=gt.${afterYear}`, { token, method: 'DELETE' }),
        dbRequest(`/fixed_incomes?template_id=eq.${templateId}&year=eq.${afterYear}&month=gt.${afterMonth}`, { token, method: 'DELETE' }),
      ]),
    listFutureMonths: (token, afterMonth, afterYear) =>
      Promise.all([
        dbRequest(`/fixed_incomes?year=gt.${afterYear}&select=month,year`, { token }),
        dbRequest(`/fixed_incomes?year=eq.${afterYear}&month=gt.${afterMonth}&select=month,year`, { token }),
      ]).then(([a, b]) => [...(a ?? []), ...(b ?? [])]),
  },

  incomeTemplates: {
    list: (token) =>
      dbRequest(
        `/fixed_income_templates?order=due_day.asc.nullslast,created_at.asc`,
        { token }
      ),
    create: (token, payload) =>
      dbRequest('/fixed_income_templates', { token, method: 'POST', body: payload }),
    update: (token, id, payload) =>
      dbRequest(`/fixed_income_templates?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/fixed_income_templates?id=eq.${id}`, { token, method: 'DELETE' }),
  },

  // ── Gastos extras ──────────────────────────────────────────────────────────
  extraExpenses: {
    list: (token, month, year) =>
      dbRequest(
        `/extra_expenses?month=eq.${month}&year=eq.${year}&order=due_day.asc.nullslast,created_at.asc`,
        { token }
      ),
    create: (token, payload) =>
      dbRequest('/extra_expenses', { token, method: 'POST', body: payload }),
    update: (token, id, payload) =>
      dbRequest(`/extra_expenses?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/extra_expenses?id=eq.${id}`, { token, method: 'DELETE' }),
  },

  extraExpenseCategories: {
    list: (token) =>
      dbRequest('/extra_expense_categories?order=name.asc', { token }),
    create: (token, payload) =>
      dbRequest('/extra_expense_categories', { token, method: 'POST', body: payload }),
    update: (token, id, payload) =>
      dbRequest(`/extra_expense_categories?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/extra_expense_categories?id=eq.${id}`, { token, method: 'DELETE' }),
  },

  // ── Tarjeta negra ──────────────────────────────────────────────────────────
  blackCardExpenses: {
    list: (token, month, year) =>
      dbRequest(
        `/black_card_expenses?month=eq.${month}&year=eq.${year}&order=due_day.asc.nullslast,created_at.asc`,
        { token }
      ),
    create: (token, payload) =>
      dbRequest('/black_card_expenses', { token, method: 'POST', body: payload }),
    update: (token, id, payload) =>
      dbRequest(`/black_card_expenses?id=eq.${id}`, { token, method: 'PATCH', body: payload }),
    remove: (token, id) =>
      dbRequest(`/black_card_expenses?id=eq.${id}`, { token, method: 'DELETE' }),
  },
}
