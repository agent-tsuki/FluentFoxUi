/**
 * Makes in-app navigation feel instant without a "download everything" step:
 *
 * 1. Intent: when a pointer rests on an internal link, a finger touches it,
 *    or keyboard focus reaches it, that page's code, data and main image
 *    start loading (prefetchRoute), usually 100–300 ms before the click.
 * 2. Idle: once the first page has loaded and gone quiet, the code of the main
 *    sections is fetched in the background, so even a first click on them
 *    waits for no code. The service worker keeps those files for later visits.
 *
 * Both respect the network: nothing extra on 2G, and with Save-Data on only
 * intent prefetch runs, without images. One set of document listeners covers
 * every link, so components need no changes.
 */
import { whenPageSettles } from '@/lib/afterPageSettles'
import { prefetchRoute } from '@/lib/routePreload'

interface NetworkInformationLike {
  saveData?: boolean
  effectiveType?: string
}

function connection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection
}

const SLOW_TYPES = new Set(['slow-2g', '2g'])

function networkMode(): 'full' | 'save' | 'off' {
  const c = connection()
  if (c?.effectiveType && SLOW_TYPES.has(c.effectiveType)) return 'off'
  return c?.saveData ? 'save' : 'full'
}

/** The internal link an event came from, if it is one worth warming. */
function internalLink(target: EventTarget | null): URL | null {
  const a = target instanceof Element ? target.closest('a[href]') : null
  if (!(a instanceof HTMLAnchorElement) || a.target === '_blank' || a.hasAttribute('download')) return null
  const url = new URL(a.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null
  return url
}

function onIntent(e: Event) {
  const mode = networkMode()
  if (mode === 'off') return
  const url = internalLink(e.target)
  if (url) prefetchRoute(url.pathname, url.search, { saveData: mode === 'save' })
}

/**
 * Main sections, warmed (code only) once the first page is idle. Quiz is left
 * to intent prefetch: it needs sign-in and pulls in the animation library
 * (~125 KB of the ~250 KB this list would otherwise cost).
 */
const MAIN_SECTIONS = ['/grammar/n5', '/kana/hiragana', '/kanji', '/classes'] as const
/** Sections that need a signed-in learner; warmed only for returning learners. */
const LEARNER_SECTIONS = ['/dashboard', '/review'] as const
const SESSION_HINT_KEY = 'ff-session-hint'

function hasSessionHint(): boolean {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1'
  } catch {
    return false
  }
}

function prefetchMainSections() {
  if (networkMode() !== 'full') return
  const paths: readonly string[] = hasSessionHint() ? [...MAIN_SECTIONS, ...LEARNER_SECTIONS] : MAIN_SECTIONS
  // Code and public data only (prefetchRoute); images wait for intent so idle
  // warm-up stays small (route code is ~10–50 KB per section).
  for (const path of paths) prefetchRoute(path, '', { saveData: true })
}

let installed = false

export function installRoutePrefetch(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  const passive = { passive: true, capture: true } as const
  document.addEventListener('pointerover', onIntent, passive)
  document.addEventListener('touchstart', onIntent, passive)
  document.addEventListener('focusin', onIntent, passive)
  whenPageSettles(prefetchMainSections)
}
