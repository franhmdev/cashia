import { useState, useCallback, useRef } from 'react'

/**
 * Persiste un valor en localStorage y lo sincroniza con el estado.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`useLocalStorage [${key}]:`, error)
    }
  }

  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`useLocalStorage [${key}]:`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}
