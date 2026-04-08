import styles from './Button.module.scss'

/**
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        loading ? styles['btn--loading'] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className={styles['btn__spinner']} aria-hidden="true" />}
      {children}
    </button>
  )
}
