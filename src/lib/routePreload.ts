import { asset } from '@/lib/assets'
import { boardPhonePath, BOARD_SIZES, n5BoardPath } from '@/lib/content/grammar/boards'
import { KANA_PAGE_LOADERS, KANJI_PAGE_LOADERS } from '@/pages/coursePageLoaders'

/**
 * Starts everything the first route needs at once, as soon as the app boots.
 *
 * Without this a deep link loads in steps, each waiting for the one before:
 * app code → route code → layout code → page code → data → main image. On a
 * slow phone every step is a full network round trip. Here they all start
 * together; React then finds them ready (dynamic imports and service requests
 * are shared, never sent twice). Only the first page load is handled: later
 * navigations happen inside the running app.
 */
export function preloadCurrentRoute(pathname: string, search: string): void {
  let path: string
  try {
    path = decodeURIComponent(pathname).replace(/\/+$/, '') || '/'
  } catch {
    return // A malformed URL is the router's problem (404), not a reason to fail boot.
  }

  const kana = /^\/kana\/(hiragana|katakana)(?:\/(chart|learn|tests|downloads))?$/.exec(path)
  if (kana) {
    void import('@/pages/KanaScriptRoute')
    void import('@/pages/KanaCourseLayout')
    const page = kana[2] === 'learn' ? 'course' : (kana[2] ?? 'chart')
    void KANA_PAGE_LOADERS[page as keyof typeof KANA_PAGE_LOADERS]()
    return
  }

  const kanjiLevel = /^\/kanji\/(n5|n4)(?:\/(reviews|browse|tests|downloads))?$/.exec(path)
  if (kanjiLevel) {
    void import('@/pages/KanjiLevelRoute')
    void import('@/pages/KanjiCourseLayout')
    void KANJI_PAGE_LOADERS[(kanjiLevel[2] ?? 'course') as keyof typeof KANJI_PAGE_LOADERS]()
    const level = kanjiLevel[1] as 'n5' | 'n4'
    void import('@/api/services/kanjiService').then(({ kanjiService }) => kanjiService.getLevelIndex(level))
    return
  }

  const kanjiChar = /^\/kanji\/([^/]+)$/.exec(path)
  if (kanjiChar) {
    void import('@/pages/KanjiDetailPage')
    void import('@/api/services/kanjiService').then(({ kanjiService }) => kanjiService.getKanji(kanjiChar[1]))
    return
  }

  const grammar = /^\/grammar\/n5(?:\/(\d+))?$/.exec(path)
  if (grammar) {
    void import('@/pages/GrammarPage')
    const board = n5BoardPath(Number(grammar[1] ?? 1))
    if (board) preloadImage(asset(board), `${asset(boardPhonePath(board))} 768w, ${asset(board)} 1280w`, BOARD_SIZES)
    return
  }

  if (path === '/classes') {
    void import('@/pages/ClassesPage')
    preconnect('https://i.ytimg.com')
    // Same filters the page uses when the URL has none, so the request is shared.
    if (!search) {
      void import('@/api/services/classesService').then(({ classesService }) =>
        classesService.listClasses({ level: 'N5', platform: undefined, freeOnly: false }).catch(() => {}),
      )
    }
  }
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

function preconnect(origin: string) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = origin
  document.head.appendChild(link)
}
