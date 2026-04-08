import { Link } from '@/router'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import styles from './Navbar.module.scss'

const NAV_LINKS = [
  { to: '/home',   label: 'Inicio' },
  { to: '/about',  label: 'Acerca' },
]

export function Navbar() {
  const { isDark, toggle } = useTheme()
  const { logout, user }   = useAuth()

  return (
    <header className={styles.navbar}>
      <nav className={`${styles['navbar__inner']} o-container`} aria-label="Navegación principal">
        <Link to="/home" className={styles['navbar__brand']}>
          Cashia
        </Link>

        <ul className={styles['navbar__links']} role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className={styles['navbar__link']}>{label}</Link>
            </li>
          ))}
        </ul>

        <button
          className={styles['navbar__theme-toggle']}
          onClick={toggle}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {user && (
          <button
            className={styles['navbar__logout']}
            onClick={logout}
            title={`Cerrar sesión (${user.email})`}
          >
            Salir
          </button>
        )}
      </nav>
    </header>
  )
}
