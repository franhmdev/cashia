import { useState } from 'react'
import { useRouter } from '@/router'
import { AuthLayout } from '@/components/AuthLayout/AuthLayout'
import { Button } from '@/components/Button/Button'
import { PasswordStrength } from '@/components/PasswordStrength/PasswordStrength'
import { usePasswordStrength } from '@/hooks/usePasswordStrength'
import styles from './Register.module.scss'

// ─── Íconos ───────────────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="2" x2="22" y2="22"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Validación ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form, strength) {
  const err = {}
  if (!form.name.trim())          err.name = 'El nombre es requerido'
  if (!form.email)                err.email = 'El email es requerido'
  else if (!EMAIL_RE.test(form.email)) err.email = 'Ingresa un email válido'
  if (!form.password)             err.password = 'La contraseña es requerida'
  else if (strength.score < 4)    err.password = 'La contraseña no cumple todos los requisitos de seguridad'
  if (!form.confirm)              err.confirm = 'Confirma tu contraseña'
  else if (form.confirm !== form.password) err.confirm = 'Las contraseñas no coinciden'
  return err
}

// ─── Página Register ──────────────────────────────────────────────────────────
export default function Register() {
  const { navigate } = useRouter()
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors]     = useState({})
  const [showPwd, setShowPwd]   = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)

  const strength = usePasswordStrength(form.password)

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate(form, strength)
    if (Object.keys(err).length) { setErrors(err); return }

    setLoading(true)
    // Simulación de llamada a API (800ms)
    await new Promise((r) => setTimeout(r, 800))

    sessionStorage.setItem('cashia_user', JSON.stringify({ name: form.name, email: form.email }))
    setLoading(false)
    navigate('/home')
  }

  return (
    <AuthLayout>
      <div className={styles['register']}>

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div className={styles['register__brand']}>
          <span className={styles['register__brand-icon']} aria-hidden="true" />
          <span className={styles['register__brand-name']}>Cashia</span>
        </div>

        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className={styles['register__header']}>
          <h1 className={styles['register__title']}>
            Create<br />Account
          </h1>
          <p className={styles['register__subtitle']}>
            Join Cashia — it only takes a minute
          </p>
        </div>

        {/* ── Formulario ─────────────────────────────────────────────────── */}
        <form className={styles['register__form']} onSubmit={handleSubmit} noValidate>

          {/* Nombre */}
          <div className={styles['register__field']}>
            <input
              id="reg-name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={setField('name')}
              autoComplete="name"
              aria-describedby={errors.name ? 'reg-name-err' : undefined}
              className={[
                styles['register__input'],
                errors.name ? styles['register__input--error'] : '',
              ].filter(Boolean).join(' ')}
            />
            {errors.name && (
              <span id="reg-name-err" className={styles['register__field-error']} role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className={styles['register__field']}>
            <input
              id="reg-email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={setField('email')}
              autoComplete="email"
              aria-describedby={errors.email ? 'reg-email-err' : undefined}
              className={[
                styles['register__input'],
                errors.email ? styles['register__input--error'] : '',
              ].filter(Boolean).join(' ')}
            />
            {errors.email && (
              <span id="reg-email-err" className={styles['register__field-error']} role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Contraseña */}
          <div className={styles['register__field']}>
            <div className={styles['register__pwd-wrap']}>
              <input
                id="reg-password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Create a password"
                value={form.password}
                onChange={setField('password')}
                autoComplete="new-password"
                aria-describedby={errors.password ? 'reg-pwd-err' : 'reg-pwd-strength'}
                className={[
                  styles['register__input'],
                  errors.password ? styles['register__input--error'] : '',
                ].filter(Boolean).join(' ')}
              />
              <button
                type="button"
                className={styles['register__pwd-toggle']}
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <span id="reg-pwd-err" className={styles['register__field-error']} role="alert">
                {errors.password}
              </span>
            )}
            {/* Indicador de fortaleza */}
            <div id="reg-pwd-strength">
              <PasswordStrength password={form.password} strength={strength} />
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className={styles['register__field']}>
            <div className={styles['register__pwd-wrap']}>
              <input
                id="reg-confirm"
                type={showConf ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={setField('confirm')}
                autoComplete="new-password"
                aria-describedby={errors.confirm ? 'reg-conf-err' : undefined}
                className={[
                  styles['register__input'],
                  errors.confirm ? styles['register__input--error'] : '',
                  !errors.confirm && form.confirm && form.confirm === form.password
                    ? styles['register__input--valid']
                    : '',
                ].filter(Boolean).join(' ')}
              />
              <button
                type="button"
                className={styles['register__pwd-toggle']}
                onClick={() => setShowConf((v) => !v)}
                aria-label={showConf ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {showConf ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirm && (
              <span id="reg-conf-err" className={styles['register__field-error']} role="alert">
                {errors.confirm}
              </span>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className={styles['register__submit']}
          >
            Create Account
          </Button>
        </form>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <p className={styles['register__footer']}>
          Already have an account?{' '}
          <button
            type="button"
            className={styles['register__login-link']}
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
