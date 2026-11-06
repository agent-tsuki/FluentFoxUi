import type { ComponentType } from 'react'
import type { CoursePageId } from '@/components/kanaCourse/coursePages'
import type { KanjiLevelPageId } from '@/lib/content/kanji/levels'

type PageLoader = () => Promise<{ default: ComponentType }>

/**
 * Chunk loaders for the pages inside the kana and kanji course layouts. App.tsx
 * builds its lazy routes from these, and each layout calls the current page's
 * loader as soon as it mounts, so the page code downloads in parallel with the
 * course data instead of after it. Calling a loader twice reuses the same
 * request (dynamic imports are cached).
 */
export const KANA_PAGE_LOADERS = {
  chart: () => import('@/pages/KanaChartPage').then((m) => ({ default: m.KanaChartPage })),
  course: () => import('@/pages/KanaCoursePage').then((m) => ({ default: m.KanaCoursePage })),
  tests: () => import('@/pages/KanaTestsPage').then((m) => ({ default: m.KanaTestsPage })),
  downloads: () => import('@/pages/KanaDownloadsPage').then((m) => ({ default: m.KanaDownloadsPage })),
} satisfies Record<CoursePageId, PageLoader>

export const KANJI_PAGE_LOADERS = {
  course: () => import('@/pages/KanjiCoursePage').then((m) => ({ default: m.KanjiCoursePage })),
  reviews: () => import('@/pages/KanjiReviewsPage').then((m) => ({ default: m.KanjiReviewsPage })),
  browse: () => import('@/pages/KanjiBrowsePage').then((m) => ({ default: m.KanjiBrowsePage })),
  tests: () => import('@/pages/KanjiTestsPage').then((m) => ({ default: m.KanjiTestsPage })),
  downloads: () => import('@/pages/KanjiDownloadsPage').then((m) => ({ default: m.KanjiDownloadsPage })),
} satisfies Record<KanjiLevelPageId, PageLoader>
