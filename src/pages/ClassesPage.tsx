import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { ClassesFilterBar } from '@/components/classes/ClassesFilterBar'
import { CourseGrid, CourseGridSkeleton } from '@/components/classes/CourseGrid'
import { LINK_BUTTON } from '@/components/classes/linkStyles'
import { useClasses } from '@/hooks/useClasses'
import { cn } from '@/lib/cn'
import { resolveErrorMessage } from '@/api/errors'
import { CLASS_PLATFORMS } from '@/lib/classes/platformMeta'
import type { JlptLevel } from '@/types'
import type { ClassesFilters, ClassesMeta, ClassPlatform } from '@/types/classes'

// Kept for existing importers; the source of truth is lib/classes/platformMeta.
export { PLATFORM_META, type PlatformMeta } from '@/lib/classes/platformMeta'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const DEFAULT_LEVEL: JlptLevel = 'N5'
// A 5-column grid only pays off with a long list; fewer courses leave a lone card on the last row.
const FIVE_COLUMN_MIN_COURSES = 10

/** Filters live in the URL (?level=N4&platform=youtube&free=1) so Back from a course keeps them. */
function readFilters(params: URLSearchParams): Required<Pick<ClassesFilters, 'level'>> & { platform: ClassPlatform | null; freeOnly: boolean } {
  const level = params.get('level')
  const platform = params.get('platform')
  return {
    level: LEVELS.includes(level as JlptLevel) ? (level as JlptLevel) : DEFAULT_LEVEL,
    platform: CLASS_PLATFORMS.includes(platform as ClassPlatform) ? (platform as ClassPlatform) : null,
    freeOnly: params.get('free') === '1',
  }
}

export function ClassesPage() {
  const [params, setParams] = useSearchParams()
  const { level, platform, freeOnly } = readFilters(params)
  const filters = useMemo<ClassesFilters>(
    () => ({ level, platform: platform ?? undefined, freeOnly }),
    [level, platform, freeOnly],
  )
  const { data, isLoading, error, refetch, meta } = useClasses(filters)

  const update = useCallback(
    (next: { level?: JlptLevel; platform?: ClassPlatform | null; freeOnly?: boolean }) => {
      setParams(
        prev => {
          const out = new URLSearchParams(prev)
          const set = (key: string, value: string | null) => (value ? out.set(key, value) : out.delete(key))
          if (next.level !== undefined) set('level', next.level === DEFAULT_LEVEL ? null : next.level)
          if (next.platform !== undefined) set('platform', next.platform)
          if (next.freeOnly !== undefined) set('free', next.freeOnly ? '1' : null)
          return out
        },
        { replace: true },
      )
    },
    [setParams],
  )
  const clearFilters = useCallback(() => update({ platform: null, freeOnly: false }), [update])

  const levelInfo = meta?.levels.find(l => l.level === level)

  return (
    <main className="min-h-dvh pb-16 pt-nav">
      <ClassesHero meta={meta} />

      {meta ? (
        <ClassesFilterBar
          levels={meta.levels}
          level={level}
          platform={platform}
          freeOnly={freeOnly}
          onLevelChange={l => update({ level: l })}
          onPlatformChange={p => update({ platform: p })}
          onFreeOnlyChange={f => update({ freeOnly: f })}
        />
      ) : (
        !error && (
          <div aria-hidden="true" className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="flex h-12 items-center border-y border-outline-variant/40">
              <SkeletonBlock className="h-8 w-60 rounded-xl" />
            </div>
          </div>
        )
      )}

      <section aria-label={`JLPT ${level} courses`} className="mx-auto max-w-7xl px-6 pt-6 md:px-10">
        {error ? (
          <ErrorState title="Couldn't load the courses" message={resolveErrorMessage(error)} onRetry={refetch} />
        ) : levelInfo?.locked ? (
          <EmptyState
            icon="lock"
            title={`${level} courses are coming soon`}
            description={`We're still curating the best ${level} resources. Start with N5 in the meantime.`}
            actionLabel="Browse N5 courses"
            onAction={() => update({ level: 'N5' })}
          />
        ) : isLoading || !data ? (
          <CourseGridSkeleton maxCols={4} />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No courses match these filters"
            description="Try another platform, or include paid courses."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <CourseGrid courses={data.items} maxCols={data.items.length >= FIVE_COLUMN_MIN_COURSES ? 5 : 4} />
        )}
      </section>

      <SuggestResource />
    </main>
  )
}

function ClassesHero({ meta }: { meta: ClassesMeta | undefined }) {
  const stats = meta?.stats
  return (
    <section className="mx-auto max-w-7xl space-y-1.5 px-6 pb-5 pt-8 md:px-10">
      <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">Learn Japanese from great teachers</h1>
      {/* A div, not a <p>: the stats skeleton is a block element. */}
      <div className="text-sm text-on-surface-variant">
        Hand-picked YouTube playlists and courses, sorted by JLPT level
        {stats ? (
          <>
            {' · '}
            {stats.courseCount} {stats.courseCount === 1 ? 'course' : 'courses'}
            {' · '}
            {stats.channelCount} {stats.channelCount === 1 ? 'teacher' : 'teachers'}
          </>
        ) : (
          <SkeletonBlock className="ml-2 inline-block h-3 w-32 rounded-xl align-middle" />
        )}
      </div>
    </section>
  )
}

function SuggestResource() {
  return (
    <section aria-label="Suggest a resource" className="mx-auto mt-12 max-w-7xl px-6 md:px-10">
      <div className="flex flex-col items-start gap-4 rounded-xl border border-outline-variant/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">Know a resource we missed?</span> Tell us about a channel or course that helped you.
        </p>
        <a href="mailto:hello@foxsensei.app" className={cn(LINK_BUTTON.outline, 'shrink-0')}>
          <Icon name="mail" className="text-base" />
          Suggest a resource
        </a>
      </div>
    </section>
  )
}
