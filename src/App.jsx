import { RouterProvider, Routes, Route, Redirect } from '@/router'
import { Layout } from '@/components/Layout/Layout'
import Home     from '@/pages/Home'
import About    from '@/pages/About'
import Login    from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import NotFound from '@/pages/NotFound'

// Páginas que usan el layout principal (Navbar + Footer)
function HomePage()     { return <Layout><Home /></Layout> }
function AboutPage()    { return <Layout><About /></Layout> }
function NotFoundPage() { return <Layout><NotFound /></Layout> }

export default function App() {
  return (
    <RouterProvider>
      <Routes>
        {/* Auth — layout propio (split panel, sin Navbar) */}
        <Route path="/login"    component={Login} />
        <Route path="/register" component={Register} />

        {/* Raíz — redirige a login */}
        <Route path="/"         component={() => <Redirect to="/login" />} />

        {/* App — layout principal */}
        <Route path="/home"      component={HomePage} />
        <Route path="/about"     component={AboutPage} />
        <Route path="*"         component={NotFoundPage} />
      </Routes>
    </RouterProvider>
  )
}
