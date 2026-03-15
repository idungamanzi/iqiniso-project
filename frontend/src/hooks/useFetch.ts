import { useState, useEffect, useRef } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(
  fetchFn: () => Promise<{ data: T }>,
  deps: unknown[] = []
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null })
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    setState({ data: null, loading: true, error: null })

    fetchFn()
      .then((res) => {
        if (isMounted.current) setState({ data: res.data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (isMounted.current) {
          const msg = err instanceof Error ? err.message : 'Something went wrong.'
          setState({ data: null, loading: false, error: msg })
        }
      })

    return () => { isMounted.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
