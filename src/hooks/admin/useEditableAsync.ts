import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useAsync, type AsyncState } from '@/hooks/useAsync'

export interface EditableAsyncState<T> extends AsyncState<T> {
  /** Replace the loaded value locally (e.g. with a server response or an optimistic edit). */
  setData: (next: T | ((prev: T) => T)) => void
}

/**
 * useEditableAsync — useAsync plus a local override, for admin screens that
 * load a record, then keep it in sync with each write's response. A fresh load
 * (new key or refetch) replaces any local edits.
 */
export function useEditableAsync<T>(key: string, load: () => Promise<T>): EditableAsyncState<T> {
  const state = useAsync<T>(key, load)
  const [override, setOverride] = useState<{ base: T | undefined; value: T } | null>(null)
  const data = override && override.base === state.data ? override.value : state.data

  const latest = useRef({ base: state.data, data })
  useLayoutEffect(() => {
    latest.current = { base: state.data, data }
  })

  const setData = useCallback((next: T | ((prev: T) => T)) => {
    const { base, data: current } = latest.current
    if (current === undefined) return
    const value = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
    latest.current = { base, data: value }
    setOverride({ base, value })
  }, [])

  return { ...state, data, setData }
}
