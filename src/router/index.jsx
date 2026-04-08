import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Context ────────────────────────────────────────────────────────────────
const RouterContext = createContext(null)

// ─── RouterProvider ─────────────────────────────────────────────────────────
export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((path) => {
    window.history.pushState(null, '', path)
    setCurrentPath(path)
  }, [])

  const replace = useCallback((path) => {
    window.history.replaceState(null, '', path)
    setCurrentPath(path)
  }, [])

  return (
    <RouterContext.Provider value={{ currentPath, navigate, replace }}>
      {children}
    </RouterContext.Provider>
  )
}

// ─── useRouter hook ──────────────────────────────────────────────────────────
export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter debe usarse dentro de <RouterProvider>')
  return ctx
}

// ─── Route ───────────────────────────────────────────────────────────────────
export function Route({ path, component: Component }) {
  const { currentPath } = useRouter()
  return currentPath === path ? <Component /> : null
}

// ─── Routes (renderiza solo el primer match) ─────────────────────────────────
export function Routes({ children }) {
  const { currentPath } = useRouter()

  const matched = children.find((child) => {
    const routePath = child.props.path
    if (routePath === '*') return false
    return routePath === currentPath
  })

  if (matched) return matched

  const fallback = children.find((child) => child.props.path === '*')
  return fallback ?? null
}

// ─── Redirect ───────────────────────────────────────────────────────────────────
export function Redirect({ to }) {
  const { replace } = useRouter()
  useEffect(() => { replace(to) }, [to, replace])
  return null
}

// ─── Link ─────────────────────────────────────────────────────────────────────
export function Link({ to, children, className, style, ...props }) {
  const { navigate, currentPath } = useRouter()
  const isActive = currentPath === to

  const handleClick = (e) => {
    e.preventDefault()
    navigate(to)
  }

  return (
    <a
      href={to}
      onClick={handleClick}
      className={[className, isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
      style={style}
      aria-current={isActive ? 'page' : undefined}
      {...props}
    >
      {children}
    </a>
  )
}
