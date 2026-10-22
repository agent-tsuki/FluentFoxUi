import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonBlock } from '@/components/ui/LoadingState'
import { ClassesFilterBar } from '@/components/classes/ClassesFilterBar'
import { CourseGrid, CourseGridSkeleton } from '@/components/classes/CourseGrid'
import { useClasses } from '@/hooks/useClasses'
import { resolveErrorMessage } from '@/api/errors'
import { CLASS_PLATFORMS } from '@/lib/classes/platformMeta'
import type { JlptLevel } from '@/types'
import type { ClassesFilters, ClassesMeta, ClassPlatform } from '@/types/classes'

// Kept for existing importers; the source of truth is lib/classes/platformMeta.
export { PLATFORM_META, type PlatformMeta } from '@/lib/classes/platformMeta'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const DEFAULT_LEVEL: JlptLevel = 'N5'

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
    <main className="min-h-dvh pb-20 pt-24">
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
        !error && <div aria-hidden="true" className="mx-auto max-w-7xl px-6 py-3 md:px-10"><SkeletonBlock className="h-12 w-72 rounded-xl" /></div>
      )}

      <section aria-label={`JLPT ${level} courses`} className="mx-auto max-w-7xl px-6 pt-8 md:px-10">
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
          <CourseGridSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No courses match these filters"
            description="Try another platform, or include paid courses."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <CourseGrid courses={data.items} />
        )}
      </section>

      <SuggestResource />
    </main>
  )
}

function ClassesHero({ meta }: { meta: ClassesMeta | undefined }) {
  const stats = meta?.stats
  return (
    <section className="mx-auto max-w-7xl space-y-4 px-6 pb-8 pt-10 text-center md:px-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
        <Icon name="school" className="text-base" />
        Curated classes
      </span>
      <h1 className="font-headline text-display-lg font-extrabold tracking-tight text-on-surface">
        Learn Japanese from <span className="text-primary">great teachers</span>
      </h1>
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
        Hand-picked YouTube playlists, courses and platforms, sorted by JLPT level — with an honest look at each teacher.
      </p>
      <div className="flex min-h-6 flex-wrap items-center justify-center gap-6 pt-2 text-sm font-semibold text-on-surface-variant">
        {stats ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="play_circle" className="text-base text-primary" />
              {stats.courseCount} {stats.courseCount === 1 ? 'course' : 'courses'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="group" className="text-base text-primary" />
              {stats.channelCount} {stats.channelCount === 1 ? 'teacher' : 'teachers & channels'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="verified" className="text-base text-primary" />
              Sorted by JLPT level
            </span>
          </>
        ) : (
          <SkeletonBlock className="h-5 w-80 rounded-xl" />
        )}
      </div>
    </section>
  )
}

function SuggestResource() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-6 md:px-10">
      <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 px-8 py-10 text-center">
        <Icon name="tips_and_updates" className="text-4xl text-primary" />
        <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Know a great resource we missed?</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-on-surface-variant">
          We review and add new teachers regularly. Tell us about a channel or course that helped you.
        </p>
        <a
          href="mailto:hello@foxsensei.app"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-elevation-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Icon name="mail" className="text-base" />
          Suggest a resource
        </a>
      </div>
    </section>
  )
}
