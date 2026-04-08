import { useState } from 'react'
import { useRouter } from '@/router'
import { AuthLayout } from '@/components/AuthLayout/AuthLayout'
import { Button } from '@/components/Button/Button'
import styles from './Login.module.scss'

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

function validate(form) {
  const err = {}
  if (!form.email)               err.email = 'El email es requerido'
  else if (!EMAIL_RE.test(form.email)) err.email = 'Ingresa un email válido'
  if (!form.password)            err.password = 'La contraseña es requerida'
  return err
}

// ─── Página Login ─────────────────────────────────────────────────────────────
export default function Login() {
  const { navigate } = useRouter()
  const [form, setForm]       = useState({ email: '', password: '', remember: false })
  const [errors, setErrors]   = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const setField = (field) => (e) => {
    const val = field === 'remember' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate(form)
    if (Object.keys(err).length) { setErrors(err); return }

    setLoading(true)
    // Simulación de llamada a API (800ms)
    await new Promise((r) => setTimeout(r, 800))

    const user = { email: form.email }
    const storage = form.remember ? localStorage : sessionStorage
    storage.setItem('cashia_user', JSON.stringify(user))

    setLoading(false)
    navigate('/home')
  }

  return (
    <AuthLayout>
      <div className={styles['login']}>

        {/* ── Brand ──────────────────────────────────────────────────────── */}
        <div className={styles['login__brand']}>
          <span className={styles['login__brand-icon']} aria-hidden="true" />
          <span className={styles['login__brand-name']}>Cashia</span>
        </div>

        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className={styles['login__header']}>
          <h1 className={styles['login__title']}>
            Holla,<br />Welcome Back
          </h1>
          <p className={styles['login__subtitle']}>
            Hey, welcome back to your special place
          </p>
        </div>

        {/* ── Formulario ─────────────────────────────────────────────────── */}
        <form className={styles['login__form']} onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className={styles['login__field']}>
            <input
              id="login-email"
              type="email"
              placeholder="stanley@gmail.com"
              value={form.email}
              onChange={setField('email')}
              autoComplete="email"
              aria-describedby={errors.email ? 'login-email-err' : undefined}
              className={[
                styles['login__input'],
                errors.email ? styles['login__input--error'] : '',
              ].filter(Boolean).join(' ')}
            />
            {errors.email && (
              <span id="login-email-err" className={styles['login__field-error']} role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Contraseña */}
          <div className={styles['login__field']}>
            <div className={styles['login__pwd-wrap']}>
              <input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={form.password}
                onChange={setField('password')}
                autoComplete="current-password"
                aria-describedby={errors.password ? 'login-pwd-err' : undefined}
                className={[
                  styles['login__input'],
                  errors.password ? styles['login__input--error'] : '',
                ].filter(Boolean).join(' ')}
              />
              <button
                type="button"
                className={styles['login__pwd-toggle']}
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <span id="login-pwd-err" className={styles['login__field-error']} role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Opciones: Remember + Forgot */}
          <div className={styles['login__options']}>
            <label className={styles['login__remember']}>
              <input
                type="checkbox"
                checked={form.remember}
                onChange={setField('remember')}
                className={styles['login__checkbox']}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className={styles['login__forgot']}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className={styles['login__submit']}
          >
            Sign In
          </Button>
        </form>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <p className={styles['login__footer']}>
          Don't have an account?{' '}
          <button
            type="button"
            className={styles['login__register-link']}
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
