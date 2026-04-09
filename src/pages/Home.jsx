import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { FixedExpenses } from '@/components/FixedExpenses/FixedExpenses'
import { FixedIncomes } from '@/components/FixedIncomes/FixedIncomes'
import { ExtraExpenses } from '@/components/ExtraExpenses/ExtraExpenses'
import { SavingsSummary } from '@/components/SavingsSummary/SavingsSummary'
import { BottomNav } from '@/components/BottomNav/BottomNav'
import styles from './Home.module.scss'

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

export default function Home() {
  const { user } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [activeTab, setActiveTab] = useState('resumen')

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'usuario'

  return (
    <div className={styles.dashboard}>
      {/* Saludo */}
      <p className={styles['dashboard__greeting']}>Hola, {firstName} 👋</p>

      {/* Navegador de mes */}
      <div className={styles['dashboard__month-nav']}>
        <button
          className={styles['dashboard__nav-btn']}
          onClick={prevMonth}
          aria-label="Mes anterior"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h1 className={styles['dashboard__month-title']}>
          {MONTHS[month - 1]} {year}
        </h1>

        <button
          className={styles['dashboard__nav-btn']}
          onClick={nextMonth}
          aria-label="Mes siguiente"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Módulos */}
      <div className={styles['dashboard__modules']}>
        {activeTab === 'resumen' && (
          <SavingsSummary month={month} year={year} />
        )}
        {activeTab === 'gastos' && (
          <>
            <FixedExpenses month={month} year={year} />
            <ExtraExpenses month={month} year={year} />
          </>
        )}
        {activeTab === 'ingresos' && (
          <FixedIncomes month={month} year={year} />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
