import { useEffect, useState } from 'react'

function matches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

/**
 * Tracks whether a CSS media query matches, e.g. `useMediaQuery('(min-width: 768px)')`.
 * SSR-safe (defaults to `false`) and updates live as the viewport changes.
 */
export function useMediaQuery(query: string): boolean {
  const [isMatch, setIsMatch] = useState(() => matches(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQueryList = window.matchMedia(query)
    const handleChange = () => setIsMatch(mediaQueryList.matches)
    handleChange()
    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [query])

  return isMatch
}
