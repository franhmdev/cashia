import { RouterProvider, Routes, Route, Redirect } from '@/router'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/Layout/Layout'
import Home     from '@/pages/Home'
import Login    from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import NotFound from '@/pages/NotFound'

// ─── Ruta protegida — redirige a /login si no hay sesión ─────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Redirect to="/login" />
  return children
}

// ─── Páginas con layout ───────────────────────────────────────────────────────
function HomePage()     { return <PrivateRoute><Layout><Home /></Layout></PrivateRoute> }

function NotFoundPage() { return <Layout><NotFound /></Layout> }

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <Routes>
          {/* Auth — layout propio (split panel, sin Navbar) */}
          <Route path="/login"    component={Login} />
          <Route path="/register" component={Register} />

          {/* Raíz — redirige a login */}
          <Route path="/"         component={() => <Redirect to="/login" />} />

          {/* App — rutas protegidas */}
          <Route path="/home"     component={HomePage} />
          <Route path="*"         component={NotFoundPage} />
        </Routes>
      </RouterProvider>
    </AuthProvider>
  )
}
