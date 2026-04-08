import { useMemo } from 'react'

export const PASSWORD_RULES = [
  {
    id: 'length',
    test: (v) => v.length >= 8,
    label: 'Mínimo 8 caracteres',
  },
  {
    id: 'upper',
    test: (v) => /[A-Z]/.test(v),
    label: 'Una letra mayúscula',
  },
  {
    id: 'number',
    test: (v) => /[0-9]/.test(v),
    label: 'Un número',
  },
  {
    id: 'special',
    test: (v) => /[!@#$%^&*()\-_=+[\]{}|;:'",.<>?/\\`~]/.test(v),
    label: 'Un carácter especial (!@#$...)',
  },
]

const LEVELS = {
  0: { label: '',           key: 'none' },
  1: { label: 'Muy débil',  key: 'very-weak' },
  2: { label: 'Débil',      key: 'weak' },
  3: { label: 'Aceptable',  key: 'fair' },
  4: { label: 'Fuerte',     key: 'strong' },
}

/**
 * Evalúa la fortaleza de una contraseña contra PASSWORD_RULES.
 * @param {string} password
 * @returns {{ rules, score, label, level }}
 */
export function usePasswordStrength(password = '') {
  return useMemo(() => {
    const rules = PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: password.length > 0 && rule.test(password),
    }))
    const score = rules.filter((r) => r.passed).length
    const { label, key: level } = LEVELS[score] ?? LEVELS[4]
    return { rules, score, label, level }
  }, [password])
}
