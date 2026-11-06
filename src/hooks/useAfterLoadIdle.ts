import { useEffect, useState } from 'react'
import { isPageSettled, whenPageSettles } from '@/lib/afterPageSettles'

/**
 * True once the first screen has settled (see lib/afterPageSettles): use it to
 * start optional, heavy work (decorative animations and their libraries)
 * without competing with the page's main content on slow connections.
 */
export function useAfterLoadIdle(): boolean {
  const [ready, setReady] = useState(isPageSettled)
  useEffect(() => {
    if (ready) return
    return whenPageSettles(() => setReady(true))
  }, [ready])
  return ready
}
