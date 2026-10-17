import { useEffect, useMemo, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelIndex } from '@/hooks/useKanji'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { KANJI_TRACK } from '@/lib/learn/paths'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CourseSectionNav } from '@/components/kanaCourse/SectionNav'
import { COURSE_CONTAINER } from '@/components/kanaCourse/coursePages'
import { KanjiCourseHeader, KanjiDataCredit } from '@/components/kanji/KanjiCourseHeader'
import { kanjiPageFor, kanjiPagesFor } from '@/components/kanji/kanjiPages'
import { buildKanjiCourseContext } from '@/pages/kanjiCourseContext'
import { cn } from '@/lib/cn'

/**
 * Route layout for a kanji level (/kanji/<level> and its reviews, browse,
 * tests and downloads pages): fetches the level index once, renders the
 * header + sticky sub-nav, and hands the data to the page through
 * `<Outlet context>` (read it with `useKanjiCourse()`). Mirrors KanaCourseLayout.
 */
export function KanjiCourseLayout() {
  const level = useKanjiLevel()
  const { pathname, hash } = useLocation()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { data: index, isLoading, error, refetch } = useKanjiLevelIndex(level.id)

  const context = useMemo(() => (index ? buildKanjiCourseContext(index) : null), [index])
  const pages = useMemo(
    () => kanjiPagesFor(level, index ? { kanji: index.rows.length, units: index.units.length } : undefined),
    [level, index],
  )
  const page = kanjiPageFor(pages, pathname)
  const dueCount = useLearnSummary(KANJI_TRACK).summary?.due_now ?? 0

  useEffect(() => {
    document.title = page.documentTitle
  }, [page.documentTitle])

  // On page change (not first load), start at the top and focus the new h1.
  const lastPath = useRef<string | null>(null)
  useEffect(() => {
    const previous = lastPath.current
    lastPath.current = pathname
    if (!hash) window.scrollTo(0, 0)
    if (previous === null || previous === pathname) return
    headingRef.current?.focus({ preventScroll: true })
  }, [pathname, hash])

  const navItems = pages.map((p) => ({
    to: p.to,
    label: p.navLabel,
    end: p.id === 'course',
    badge: p.id === 'reviews' ? dueCount : undefined,
  }))

  return (
    <main className="pb-24 pt-nav">
      <div className={COURSE_CONTAINER}>
        <KanjiCourseHeader
          variant={page.id === 'course' ? 'course' : 'section'}
          title={page.heading}
          description={page.description}
          index={index ?? null}
          headingRef={headingRef}
        />
      </div>
      <CourseSectionNav label={`${level.title} course`} items={navItems} />
      <div className={cn(COURSE_CONTAINER, 'pt-6 md:pt-8')}>
        {context && context.index.units.length === 0 ? (
          <EmptyState icon="menu_book" title={`${level.title} is on its way`} description="The units for this level are not ready yet." />
        ) : context ? (
          <Outlet context={context} />
        ) : error && !isLoading ? (
          <ErrorState message={`We couldn't load ${level.title}.`} onRetry={refetch} />
        ) : (
          <LoadingState label={`Loading ${level.title}…`}>
            <div className="space-y-3">
              <SkeletonBlock className="h-40 w-full rounded-2xl" />
              <SkeletonBlock className="h-16 w-full rounded-2xl" />
              <SkeletonBlock className="h-16 w-full rounded-2xl" />
            </div>
          </LoadingState>
        )}
        <KanjiDataCredit className="mt-10" />
      </div>
    </main>
  )
}
