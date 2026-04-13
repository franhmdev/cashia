// =============================================================================
// COMPONENT » BottomNav
// Navegación inferior sticky para la app — tabs: Resumen | Gastos | Ingresos
// =============================================================================
import styles from './BottomNav.module.scss'

function ResumenIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <rect x="14" y="3" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <rect x="3" y="14" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <rect x="14" y="14" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
    </svg>
  )
}

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

function CardIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="2" y1="10" x2="22" y2="10"
        stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
      <line x1="6" y1="15" x2="9" y2="15"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <line x1="12" y1="15" x2="14" y2="15"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
    </svg>
  )
}

const TABS = [
  { id: 'resumen',  label: 'Resumen',  Icon: ResumenIcon  },
  { id: 'gastos',   label: 'Gastos',   Icon: ExpensesIcon },
  { id: 'ingresos', label: 'Ingresos', Icon: IncomesIcon  },
  { id: 'tarjeta',  label: 'Tarjeta',  Icon: CardIcon     },
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
              <span className={styles['bottom-nav__icon']}>
                <Icon active={isActive} />
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
