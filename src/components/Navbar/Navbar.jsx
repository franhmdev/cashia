import { useState, useRef, useEffect } from 'react'
import { Link } from '@/router'
import { useAuth } from '@/hooks/useAuth'
import styles from './Navbar.module.scss'

const NAV_LINKS = [
  { to: '/home',  label: 'Inicio' },
  { to: '/about', label: 'Acerca' },
]

function getInitials(user) {
  const name = user?.user_metadata?.name || user?.email || '?'
  return name
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function Navbar() {
  const { logout, user }    = useAuth()
  const [open, setOpen]     = useState(false)
  const menuRef             = useRef(null)
  const avatarUrl           = user?.user_metadata?.avatar_url

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

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

        {user && (
          <div className={styles['navbar__user']} ref={menuRef}>
            <button
              className={styles['navbar__avatar']}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label="Menú de usuario"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className={styles['navbar__avatar-img']} />
                : <span className={styles['navbar__avatar-initials']}>{getInitials(user)}</span>
              }
            </button>

            {open && (
              <div className={styles['navbar__dropdown']} role="menu">
                <div className={styles['navbar__dropdown-info']}>
                  <span className={styles['navbar__dropdown-name']}>
                    {user.user_metadata?.name || 'Usuario'}
                  </span>
                  <span className={styles['navbar__dropdown-email']}>{user.email}</span>
                </div>
                <hr className={styles['navbar__dropdown-divider']} />
                <button
                  className={styles['navbar__dropdown-item']}
                  role="menuitem"
                  onClick={() => { setOpen(false); logout() }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
