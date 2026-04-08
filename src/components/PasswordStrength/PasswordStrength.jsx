import styles from './PasswordStrength.module.scss'

/**
 * Indicador visual de fortaleza de contraseña.
 * @param {string}  password  - valor crudo del input
 * @param {object}  strength  - resultado de usePasswordStrength()
 */
export function PasswordStrength({ password, strength }) {
  const { rules, score, label, level } = strength
  if (!password) return null

  return (
    <div className={styles['pwd-strength']}>
      {/* Barra segmentada */}
      <div className={styles['pwd-strength__bar']} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={[
              styles['pwd-strength__segment'],
              i <= score ? styles[`pwd-strength__segment--${level}`] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>

      {/* Etiqueta de nivel */}
      {label && (
        <span
          className={[
            styles['pwd-strength__label'],
            styles[`pwd-strength__label--${level}`],
          ].join(' ')}
          aria-live="polite"
        >
          {label}
        </span>
      )}

      {/* Lista de requisitos */}
      <ul className={styles['pwd-strength__rules']} aria-label="Requisitos de contraseña">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className={[
              styles['pwd-strength__rule'],
              rule.passed ? styles['pwd-strength__rule--passed'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles['pwd-strength__rule-icon']} aria-hidden="true">
              {rule.passed ? '✓' : '○'}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
