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
  const data = await res.json()
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
