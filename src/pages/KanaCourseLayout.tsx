import { useEffect, useMemo, useRef } from 'react'
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CourseHeader } from '@/components/kanaCourse/CourseHeader'
import { SectionNav } from '@/components/kanaCourse/SectionNav'
import { COURSE_CONTAINER, coursePageFor } from '@/components/kanaCourse/coursePages'
import { cn } from '@/lib/cn'
import type { KanaCourseContext } from '@/pages/kanaCourseContext'

/** Where the old `?tab=` values now live, relative to the course base (anything else goes to Course). */
const LEGACY_TABS: ReadonlyMap<string, string> = new Map([
  ['learn', ''],
  ['chart', '/downloads'], // the old "chart" tab held the poster downloads
  ['test', '/tests'],
])

/**
 * Route layout for a kana course (/kana/<script> and its chart, tests and
 * downloads pages): fetches the script's kana once, renders the shared
 * CourseHeader + sticky SectionNav, and hands the data to the page through
 * `<Outlet context>` (read it with `useKanaCourse()`). Also owns the
 * document title, focus-on-navigate and the legacy `?tab=` redirects.
 */
export function KanaCourseLayout() {
  const script = useKanaScript()
  const { pathname, hash } = useLocation()
  const [params] = useSearchParams()
  const legacyTab = params.get('tab')
  const page = coursePageFor(script, pathname)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const { sections, isLoading, error, refetch } = useKanaSections()
  const legacyTabKey = script.storageKeys.legacyTab

  const context = useMemo<KanaCourseContext | null>(() => {
    if (!sections) return null
    const allKana = sections.flatMap((s) => s.chars).filter((c) => !c.isEmpty)
    return { sections, allKana, kanaById: new Map(allKana.map((c) => [c.id, c])), refetch }
  }, [sections, refetch])

  useEffect(() => {
    if (!legacyTabKey) return
    try {
      localStorage.removeItem(legacyTabKey) // the old tab UI remembered the last tab here
    } catch {
      /* storage blocked: nothing to clean up */
    }
  }, [legacyTabKey])

  useEffect(() => {
    document.title = page.documentTitle
  }, [page.documentTitle])

  // On page change (not first load), start at the top and move focus to the
  // new h1 so screen readers announce it. A #hash target is left to the page.
  const lastPath = useRef<string | null>(null)
  useEffect(() => {
    const previous = lastPath.current
    lastPath.current = pathname
    if (!hash) window.scrollTo(0, 0)
    if (previous === null || previous === pathname) return
    headingRef.current?.focus({ preventScroll: true })
  }, [pathname, hash])

  if (legacyTab !== null) {
    return <Navigate to={script.basePath + (LEGACY_TABS.get(legacyTab) ?? '')} replace />
  }

  return (
    <main className="pb-24 pt-nav">
      <div className={COURSE_CONTAINER}>
        <CourseHeader
          variant={page.id === 'course' ? 'course' : 'section'}
          title={page.heading}
          description={page.description}
          allKana={context?.allKana ?? null}
          headingRef={headingRef}
        />
      </div>
      <SectionNav />
      <div className={cn(COURSE_CONTAINER, 'pt-6 md:pt-8')}>
        {context ? (
          <Outlet context={context} />
        ) : error && !isLoading ? (
          <ErrorState message={`We couldn't load the ${script.label.toLowerCase()} course.`} onRetry={refetch} />
        ) : (
          <LoadingState label={`Loading ${script.label.toLowerCase()} course…`}>
            <div className="space-y-3">
              <SkeletonBlock className="h-40 w-full rounded-2xl" />
              <SkeletonBlock className="h-16 w-full rounded-2xl" />
              <SkeletonBlock className="h-16 w-full rounded-2xl" />
            </div>
          </LoadingState>
        )}
      </div>
    </main>
  )
}
