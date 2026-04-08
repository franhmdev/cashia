import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook para fetch de datos con control de estado, abort y caché básico.
 */
export function useFetch(url, options = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const abortRef              = useRef(null)

  const fetchData = useCallback(async () => {
    if (!url) return

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(url, {
        ...options,
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

      const json = await res.json()
      setData(json)
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
