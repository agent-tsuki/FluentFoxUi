import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

/**
 * Tracks the user's `prefers-reduced-motion` OS/browser preference.
 *
 * SSR-safe (defaults to `false` when `window`/`matchMedia` aren't available)
 * and stays in sync if the preference changes while the app is open (e.g. the
 * user flips the setting in devtools or their OS while a page is mounted).
 *
 * JS-driven motion (canvas loops, WebGL globes, Lottie/confetti) can't be
 * neutralized by the global CSS `prefers-reduced-motion` rule in
 * `src/index.css`, so components that drive their own rAF/interval loops
 * must gate on this hook explicitly.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(getInitialReducedMotion)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mediaQueryList = window.matchMedia(QUERY)
    const handleChange = () => setReducedMotion(mediaQueryList.matches)

    // Re-sync in case the preference changed between initial render and mount.
    handleChange()

    mediaQueryList.addEventListener('change', handleChange)
    return () => mediaQueryList.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}
