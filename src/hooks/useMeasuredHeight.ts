import { useCallback, useLayoutEffect, useState } from 'react'

/**
 * Measures an element's rendered height and keeps it in sync with a
 * ResizeObserver. Attach the returned callback `ref` to the element whose
 * natural height you want (its height must not be constrained by the parent
 * you animate). Works when the element mounts later than the component.
 *
 * Returns `height: undefined` until the first measurement.
 */
export function useMeasuredHeight<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const ref = useCallback((node: T | null) => setElement(node), [])

  useLayoutEffect(() => {
    if (!element) {
      setHeight(undefined)
      return
    }
    setHeight(element.offsetHeight)
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return { ref, height }
}
