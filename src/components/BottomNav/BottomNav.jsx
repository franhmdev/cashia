// =============================================================================
// COMPONENT » BottomNav
// Navegación inferior sticky para la app — tabs: Gastos | Ingresos
// =============================================================================
import styles from './BottomNav.module.scss'

function ExpensesIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <path d="M8 21h8M12 17v4"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
      <path d="M7 9h1.5M12 9h1M16 9h1"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <path d="M7 12h4"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
    </svg>
  )
}

function IncomesIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <polyline
        points="23 6 13.5 15.5 8.5 10.5 1 18"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="17 6 23 6 23 12"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const TABS = [
  { id: 'gastos',   label: 'Gastos',   Icon: ExpensesIcon },
  { id: 'ingresos', label: 'Ingresos', Icon: IncomesIcon  },
]

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className={styles['bottom-nav']} aria-label="Navegación principal">
      <div className={styles['bottom-nav__inner']}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              className={[
                styles['bottom-nav__tab'],
                isActive ? styles['bottom-nav__tab--active'] : '',
              ].join(' ')}
              onClick={() => onTabChange(id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              {isActive && <span className={styles['bottom-nav__indicator']} />}
              <span className={styles['bottom-nav__icon']}>
                <Icon active={isActive} />
              </span>
              <span className={styles['bottom-nav__label']}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
