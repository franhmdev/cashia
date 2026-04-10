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

function formatShort(value) {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k€`
  return `${sign}${abs.toFixed(0)}€`
}

// ─── SVG Bar Chart ───────────────────────────────────────────────────────────────────
function BarChart({ totalIncome, totalFixed, totalExtra, real }) {
  const BAR_W   = 48
  const GAP     = 20
  const H       = 160   // height of the chart area
  const LABEL_H = 28    // space below bars for labels
  const VALUE_H = 22    // space above bars for values
  const SVG_H   = H + LABEL_H + VALUE_H

  const bars = [
    { label: 'Ingresos',      value: totalIncome, color: '#059669' },
    { label: 'Gastos fijos',  value: totalFixed,  color: '#7c3aed' },
    { label: 'Gastos extras', value: totalExtra,  color: '#f59e0b' },
    { label: 'Ahorro real',   value: real,        color: real >= 0 ? '#0891b2' : '#dc2626' },
  ]

  const maxVal = Math.max(...bars.map(b => Math.abs(b.value)), 1)
  const totalW = bars.length * BAR_W + (bars.length - 1) * GAP

  return (
    <div className={styles['bar-chart']}>
      <svg
        viewBox={`0 0 ${totalW} ${SVG_H}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Gráfico de barras del mes"
        role="img"
      >
        {bars.map((bar, i) => {
          const x       = i * (BAR_W + GAP)
          const barH    = Math.max(4, (Math.abs(bar.value) / maxVal) * H)
          const y       = VALUE_H + (H - barH)
          const isNeg   = bar.value < 0

          return (
            <g key={bar.label}>
              {/* Barra */}
              <rect
                x={x}
                y={isNeg ? VALUE_H + H - barH : y}
                width={BAR_W}
                height={barH}
                fill={bar.color}
                rx="6"
                opacity="0.88"
              />

              {/* Valor encima */}
              <text
                x={x + BAR_W / 2}
                y={isNeg ? VALUE_H + H + 6 : y - 6}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={bar.color}
              >
                {formatShort(bar.value)}
              </text>

              {/* Etiqueta abajo */}
              <text
                x={x + BAR_W / 2}
                y={VALUE_H + H + LABEL_H - 4}
                textAnchor="middle"
                fontSize="9"
                fill="#6b7280"
              >
                {bar.label.split(' ').map((word, wi) => (
                  <tspan key={wi} x={x + BAR_W / 2} dy={wi === 0 ? 0 : 11}>
                    {word}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}

        {/* Línea base */}
        <line
          x1="0" y1={VALUE_H + H}
          x2={totalW} y2={VALUE_H + H}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
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

      {!loading && (
        <BarChart
          totalIncome={totalIncome}
          totalFixed={totalFixed}
          totalExtra={totalExtra}
          real={real}
        />
      )}
    </section>
  )
}
