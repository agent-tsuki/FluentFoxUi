import { asset } from '@/lib/assets'
import { boardPhonePath, BOARD_SIZES, n5BoardPath } from '@/lib/content/grammar/boards'
import { KANA_PAGE_LOADERS, KANJI_PAGE_LOADERS } from '@/pages/coursePageLoaders'

/**
 * Route warm-up: starts a route's code, data and main image together instead
 * of in steps (app code → route code → layout code → page code → data →
 * image, each a network round trip on a slow phone).
 *
 * - `preloadCurrentRoute` runs once at boot for the page being opened, at
 *   high priority.
 * - `prefetchRoute` runs for pages the learner is about to open (a pointer
 *   over a link, a touch, keyboard focus; see installRoutePrefetch) and for
 *   the main sections once the page is idle, at low priority.
 *
 * Dynamic imports and service requests are shared, so React later finds the
 * work done and nothing is fetched twice.
 */

interface RouteWork {
  /** Route, layout and page code. */
  code: () => void
  /** Public data the page will request (shared with the page's own request). */
  data?: () => void
  /** The page's main (LCP) image. */
  image?: { href: string; srcset?: string; sizes?: string }
}

const DASHBOARD_SECTIONS: Record<string, () => Promise<unknown>> = {
  '': () => import('@/pages/dashboard/OverviewPage'),
  activity: () => import('@/pages/dashboard/ActivityPage'),
  kana: () => import('@/pages/dashboard/KanaPage'),
  kanji: () => import('@/pages/dashboard/KanjiPage'),
  grammar: () => import('@/pages/dashboard/GrammarProgressPage'),
  review: () => import('@/pages/dashboard/ReviewInsightsPage'),
  'weak-spots': () => import('@/pages/dashboard/WeakSpotsPage'),
}

const SIMPLE_PAGES: Record<string, () => Promise<unknown>> = {
  '/quiz': () => import('@/pages/QuizPage'),
  '/review': () => import('@/pages/ReviewPage'),
  '/profile': () => import('@/pages/ProfilePage'),
  '/about': () => import('@/pages/AboutPage'),
  '/privacy': () => import('@/pages/PrivacyPage'),
  '/terms': () => import('@/pages/TermsPage'),
  '/learn/how-grading-works': () => import('@/pages/HowGradingWorksPage'),
}

function kanjiLevelWork(level: 'n5' | 'n4', page: keyof typeof KANJI_PAGE_LOADERS): RouteWork {
  return {
    code: () => {
      void import('@/pages/KanjiLevelRoute')
      void import('@/pages/KanjiCourseLayout')
      void KANJI_PAGE_LOADERS[page]()
    },
    data: () => void import('@/api/services/kanjiService').then(({ kanjiService }) => kanjiService.getLevelIndex(level)),
  }
}

/** What a path needs, or null for routes with nothing worth warming. */
function routeWork(pathname: string, search: string): RouteWork | null {
  let path: string
  try {
    path = decodeURIComponent(pathname).replace(/\/+$/, '') || '/'
  } catch {
    return null // A malformed URL is the router's problem (404), not a reason to fail.
  }

  const kana = /^\/kana\/(hiragana|katakana)(?:\/(chart|learn|tests|downloads))?$/.exec(path)
  if (kana) {
    const page = kana[2] === 'learn' ? 'course' : (kana[2] ?? 'chart')
    return {
      code: () => {
        void import('@/pages/KanaScriptRoute')
        void import('@/pages/KanaCourseLayout')
        void KANA_PAGE_LOADERS[page as keyof typeof KANA_PAGE_LOADERS]()
      },
    }
  }

  // /kanji redirects to a level course (N5 unless another was opened last).
  if (path === '/kanji') return kanjiLevelWork('n5', 'course')
  const kanjiLevel = /^\/kanji\/(n5|n4)(?:\/(reviews|browse|tests|downloads))?$/.exec(path)
  if (kanjiLevel) {
    return kanjiLevelWork(kanjiLevel[1] as 'n5' | 'n4', (kanjiLevel[2] ?? 'course') as keyof typeof KANJI_PAGE_LOADERS)
  }
  const kanjiChar = /^\/kanji\/([^/]+)$/.exec(path)
  if (kanjiChar) {
    return {
      code: () => void import('@/pages/KanjiDetailPage'),
      data: () => void import('@/api/services/kanjiService').then(({ kanjiService }) => kanjiService.getKanji(kanjiChar[1])),
    }
  }

  // /grammar/n5 opens chapter 1; other levels show the locked screen (same page code).
  const grammar = /^\/grammar\/(n[1-5])(?:\/(\d+))?(?:\/(?:vocabulary|exercise|listening))?$/.exec(path)
  if (grammar) {
    const board = grammar[1] === 'n5' ? n5BoardPath(Number(grammar[2] ?? 1)) : undefined
    const level = grammar[1]
    const chapter = Number(grammar[2] ?? 1)
    return {
      code: () => void import('@/pages/GrammarPage'),
      // Each chapter's content is its own chunk; start it with the page code.
      data: () => void import('@/api/services/grammarService').then(({ grammarService }) => grammarService.prefetchChapter(level, chapter)),
      image: board ? { href: asset(board), srcset: `${asset(boardPhonePath(board))} 768w, ${asset(board)} 1280w`, sizes: BOARD_SIZES } : undefined,
    }
  }

  if (path === '/classes') {
    return {
      code: () => {
        void import('@/pages/ClassesPage')
        preconnect('https://i.ytimg.com')
      },
      // Same filters the page uses when the URL has none, so the request is shared.
      data: search
        ? undefined
        : () =>
            void import('@/api/services/classesService').then(({ classesService }) =>
              classesService.listClasses({ level: 'N5', platform: undefined, freeOnly: false }).catch(() => {}),
            ),
    }
  }
  if (/^\/classes\/[^/]+$/.test(path)) return { code: () => void import('@/pages/ClassDetailPage') }

  const dashboard = /^\/dashboard(?:\/([a-z-]+))?$/.exec(path)
  if (dashboard) {
    const section = DASHBOARD_SECTIONS[dashboard[1] ?? '']
    return {
      code: () => {
        void import('@/pages/dashboard/DashboardLayout')
        void section?.()
      },
    }
  }

  if (/^\/learn\/lesson\/[a-z0-9_]+$/.test(path)) return { code: () => void import('@/pages/LearnLessonPage') }

  const simple = SIMPLE_PAGES[path]
  return simple ? { code: () => void simple() } : null
}

/** Boot: everything the page being opened needs, at high priority. */
export function preloadCurrentRoute(pathname: string, search: string): void {
  const work = routeWork(pathname, search)
  if (!work) return
  work.code()
  work.data?.()
  if (work.image) preloadImage(work.image.href, work.image.srcset, work.image.sizes)
}

const prefetched = new Set<string>()

/**
 * A page the learner is likely to open next: its code and data now, its main
 * image at low priority (skipped when the browser asks to save data). Each
 * path is warmed once per visit.
 */
export function prefetchRoute(pathname: string, search = '', { saveData = false } = {}): void {
  const key = pathname + search
  if (prefetched.has(key)) return
  prefetched.add(key)
  const work = routeWork(pathname, search)
  if (!work) return
  work.code()
  work.data?.()
  if (work.image && !saveData) warmImage(work.image.href, work.image.srcset, work.image.sizes)
}

function preloadImage(href: string, imageSrcset?: string, imageSizes?: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = href
  if (imageSrcset) link.setAttribute('imagesrcset', imageSrcset)
  if (imageSizes) link.setAttribute('imagesizes', imageSizes)
  link.setAttribute('fetchpriority', 'high')
  document.head.appendChild(link)
}

/** Low-priority image fetch into the HTTP cache; the browser picks the same srcset candidate the page will. */
function warmImage(href: string, srcset?: string, sizes?: string) {
  const img = new Image()
  img.decoding = 'async'
  img.setAttribute('fetchpriority', 'low')
  if (sizes) img.sizes = sizes
  if (srcset) img.srcset = srcset
  img.src = href
}

function preconnect(origin: string) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = origin
  document.head.appendChild(link)
}
