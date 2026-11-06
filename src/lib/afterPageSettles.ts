/**
 * Runs optional, non-essential work (decorative animations, analytics) only
 * once the first screen has fully settled: a few seconds after the page's load
 * event at an idle moment, or straight away on the visitor's first
 * interaction. "After load" alone is too early for lazy routes: their main
 * content often paints after the load event, and anything fetched before it
 * competes with it on slow connections.
 */

const SETTLE_DELAY_MS = 3500
const IDLE_TIMEOUT_MS = 2000
const INTERACTION_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const

let settled = false
const callbacks = new Set<() => void>()

function settle() {
  if (settled) return
  settled = true
  for (const event of INTERACTION_EVENTS) window.removeEventListener(event, settle, true)
  callbacks.forEach((callback) => callback())
  callbacks.clear()
}

function start() {
  for (const event of INTERACTION_EVENTS) window.addEventListener(event, settle, { capture: true, passive: true, once: true })
  const afterLoad = () =>
    window.setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(settle, { timeout: IDLE_TIMEOUT_MS })
      else settle()
    }, SETTLE_DELAY_MS)
  if (document.readyState === 'complete') afterLoad()
  else window.addEventListener('load', afterLoad, { once: true })
}

// Without a DOM (tests, prerendering) there is no first screen to protect.
if (typeof window === 'undefined' || typeof document === 'undefined' || typeof window.addEventListener !== 'function') settled = true
else start()

export function isPageSettled(): boolean {
  return settled
}

/** Calls `callback` once the page has settled; returns a function that cancels it. */
export function whenPageSettles(callback: () => void): () => void {
  if (settled) {
    callback()
    return () => {}
  }
  callbacks.add(callback)
  return () => {
    callbacks.delete(callback)
  }
}
