// =============================================================================
// HOOKS » useAuth — contexto de autenticación con Supabase
// Exporta <AuthProvider> para envolver la app y useAuth() para los componentes
// =============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signIn  as sbSignIn,
  signUp  as sbSignUp,
  signOut as sbSignOut,
  refreshToken,
} from '@/lib/supabase'

const STORAGE_KEY = 'cashia_session'

// ─── Helpers de persistencia ──────────────────────────────────────────────────

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function buildSession(data) {
  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user:          data.user,
  }
}

function persistSession(session, persistent) {
  const store = persistent ? localStorage : sessionStorage
  store.setItem(STORAGE_KEY, JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  // Al montar: refrescar token si está a punto de expirar (<5 min)
  useEffect(() => {
    const s = readSession()
    if (!s?.refresh_token) return
    const expiresAt = s.expires_at ?? 0
    if (Date.now() / 1000 < expiresAt - 300) return // aún válido

    refreshToken(s.refresh_token)
      .then((data) => {
        const updated = buildSession(data)
        persistSession(updated, !!localStorage.getItem(STORAGE_KEY))
        setSession(updated)
      })
      .catch(() => {
        clearSession()
        setSession(null)
      })
  }, [])

  const login = useCallback(async (email, password, remember = false) => {
    const data = await sbSignIn(email, password)
    const s = buildSession(data)
    persistSession(s, remember)
    setSession(s)
    return s
  }, [])

  const register = useCallback(async (email, password, name) => {
    const data = await sbSignUp(email, password, name)
    if (data.access_token) {
      // Email confirmation desactivada → login automático
      const s = buildSession(data)
      persistSession(s, true)
      setSession(s)
      return { needsConfirmation: false }
    }
    // Email confirmation activada (por defecto en Supabase)
    return { needsConfirmation: true }
  }, [])

  const logout = useCallback(async () => {
    if (session?.access_token) {
      try { await sbSignOut(session.access_token) } catch { /* ignorar errores de red */ }
    }
    clearSession()
    setSession(null)
  }, [session])

  return (
    <AuthContext.Provider value={{
      session,
      user:            session?.user ?? null,
      isAuthenticated: !!session,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
