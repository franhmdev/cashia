// =============================================================================
// COMPONENT » SavingsSummary
// Muestra el ahorro previsto vs ahorro real del mes en un grid de 2 columnas
// =============================================================================
import { useFixedIncomes }  from '@/hooks/useFixedIncomes'
import { useFixedExpenses } from '@/hooks/useFixedExpenses'
import { useExtraExpenses } from '@/hooks/useExtraExpenses'
import styles from './SavingsSummary.module.scss'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style:    'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value)
}

function SavingsCard({ label, amount, description, icon }) {
  const isPositive = amount >= 0
  return (
    <div className={styles['savings-card']}>
      <span className={styles['savings-card__icon']} aria-hidden="true">{icon}</span>
      <p className={styles['savings-card__label']}>{label}</p>
      <p className={[
        styles['savings-card__amount'],
        isPositive ? styles['savings-card__amount--positive'] : styles['savings-card__amount--negative'],
      ].join(' ')}>
        {formatCurrency(amount)}
      </p>
      <p className={styles['savings-card__desc']}>{description}</p>
    </div>
  )
}

export function SavingsSummary({ month, year }) {
  const { total: totalIncome,   loading: loadingI } = useFixedIncomes(month, year)
  const { total: totalFixed,    loading: loadingF } = useFixedExpenses(month, year)
  const { total: totalExtra,    loading: loadingE } = useExtraExpenses(month, year)

  const loading = loadingI || loadingF || loadingE

  const previsto = totalIncome - totalFixed
  const real     = totalIncome - totalFixed - totalExtra

  return (
    <section className={styles['savings-summary']}>
      <h2 className={styles['savings-summary__title']}>Resumen del mes</h2>

      {loading
        ? <div className={styles['savings-summary__skeleton']} aria-busy="true" />
        : (
          <div className={styles['savings-summary__grid']}>
            <SavingsCard
              label="Ahorro previsto"
              amount={previsto}
              description="Ingresos − gastos fijos"
              icon={
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path d="M12 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M18 20V4"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6 20v-4"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <SavingsCard
              label="Ahorro real"
              amount={real}
              description="Ingresos − fijos − extras"
              icon={
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        )
      }

      {!loading && (
        <div className={styles['savings-summary__breakdown']}>
          <div className={styles['savings-summary__row']}>
            <span>Ingresos totales</span>
            <span className={styles['savings-summary__value--income']}>{formatCurrency(totalIncome)}</span>
          </div>
          <div className={styles['savings-summary__row']}>
            <span>Gastos fijos</span>
            <span className={styles['savings-summary__value--expense']}>−{formatCurrency(totalFixed)}</span>
          </div>
          <div className={styles['savings-summary__row']}>
            <span>Gastos extras</span>
            <span className={styles['savings-summary__value--expense']}>−{formatCurrency(totalExtra)}</span>
          </div>
          <div className={[styles['savings-summary__row'], styles['savings-summary__row--total']].join(' ')}>
            <span>Ahorro real</span>
            <span className={real >= 0
              ? styles['savings-summary__value--positive']
              : styles['savings-summary__value--negative']}
            >
              {formatCurrency(real)}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
