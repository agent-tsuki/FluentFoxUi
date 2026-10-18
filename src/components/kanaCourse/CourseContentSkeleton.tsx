import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'

/** Page shapes used while the public course payload is loading. */
export type CourseSkeletonVariant = 'chart' | 'course' | 'list' | 'browse'

interface CourseContentSkeletonProps {
  label: string
  variant: CourseSkeletonVariant
}

const CHART_CELLS = Array.from({ length: 20 }, (_, index) => index)
const CURRICULUM_ROWS = Array.from({ length: 4 }, (_, index) => index)
const LIST_ROWS = Array.from({ length: 3 }, (_, index) => index)
const BROWSE_TILES = Array.from({ length: 14 }, (_, index) => index)

/**
 * A content-shaped loading state for the shared kana and kanji course shells.
 * Keeping the major panels, rows and side rail in place prevents layout shift
 * when a locally cached course is unavailable or has expired.
 */
export function CourseContentSkeleton({ label, variant }: CourseContentSkeletonProps) {
  return (
    <LoadingState label={label}>
      {variant === 'chart' ? <ChartSkeleton /> : null}
      {variant === 'course' ? <CourseSkeleton /> : null}
      {variant === 'browse' ? <BrowseSkeleton /> : null}
      {variant === 'list' ? <ListSkeleton /> : null}
    </LoadingState>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-5 w-full max-w-2xl rounded-lg" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 border-b border-outline-variant/60 pb-4">
            <SkeletonBlock className="h-11 w-20 rounded-xl" />
            <SkeletonBlock className="h-11 w-24 rounded-xl" />
            <SkeletonBlock className="h-11 w-28 rounded-xl" />
            <SkeletonBlock className="h-11 w-11 rounded-xl" />
          </div>
          <div className="mt-8">
            <SkeletonBlock className="h-7 w-32 rounded-lg" />
            <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
              {CHART_CELLS.map((cell) => <SkeletonBlock key={cell} className="aspect-[.82] rounded-2xl" />)}
            </div>
          </div>
        </div>
        <aside className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low">
          <SkeletonBlock className="h-6 w-32 rounded-lg" />
          <SkeletonBlock className="mt-5 h-4 w-full rounded-lg" />
          <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-lg" />
          <SkeletonBlock className="mt-6 h-24 w-full rounded-xl" />
          <SkeletonBlock className="mt-6 h-10 w-40 rounded-lg" />
        </aside>
      </div>
    </div>
  )
}

function CourseSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
      <div className="min-w-0 space-y-8 md:space-y-10">
        <section className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-6">
          <SkeletonBlock className="h-3 w-28 rounded-full" />
          <SkeletonBlock className="mt-3 h-8 w-2/3 rounded-lg" />
          <SkeletonBlock className="mt-3 h-4 w-full max-w-xl rounded-lg" />
          <SkeletonBlock className="mt-2 h-4 w-4/5 rounded-lg" />
          <SkeletonBlock className="mt-5 h-11 w-40 rounded-xl" />
        </section>
        <SkeletonBlock className="h-14 w-full rounded-2xl" />
        <CurriculumSkeleton />
        <CurriculumSkeleton />
      </div>
      <aside className="mt-10 lg:mt-0">
        <SkeletonBlock className="h-6 w-24 rounded-lg" />
        <SkeletonBlock className="mt-2 h-4 w-full rounded-lg" />
        <div className="mt-4 space-y-2">
          {LIST_ROWS.map((row) => (
            <div key={row} className="flex min-h-12 items-center gap-3 rounded-xl px-2">
              <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4 rounded-lg" />
                <SkeletonBlock className="h-3 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

function CurriculumSkeleton() {
  return (
    <section>
      <div className="mb-3">
        <SkeletonBlock className="h-7 w-44 rounded-lg" />
        <SkeletonBlock className="mt-2 h-2 w-60 max-w-full rounded-full" />
      </div>
      <div className="divide-y divide-outline-variant/60 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest dark:divide-outline/40 dark:border-outline/60 dark:bg-surface-container-low">
        {CURRICULUM_ROWS.map((row) => (
          <div key={row} className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-4">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/2 rounded-lg" />
              <SkeletonBlock className="h-3 w-3/4 rounded-lg" />
            </div>
            <SkeletonBlock className="h-4 w-16 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  )
}

function ListSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 md:space-y-12">
      <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
        <SkeletonBlock className="h-3 w-32 rounded-full" />
        <SkeletonBlock className="mt-3 h-7 w-3/4 rounded-lg" />
        <SkeletonBlock className="mt-2 h-4 w-full rounded-lg" />
        <SkeletonBlock className="mt-4 h-11 w-40 rounded-xl" />
      </section>
      <ListSectionSkeleton />
      <ListSectionSkeleton />
    </div>
  )
}

function ListSectionSkeleton() {
  return (
    <section>
      <SkeletonBlock className="h-7 w-40 rounded-lg" />
      <SkeletonBlock className="mt-2 h-4 w-full rounded-lg" />
      <div className="mt-4 divide-y divide-outline-variant/60 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest dark:divide-outline/40 dark:border-outline/60 dark:bg-surface-container-low">
        {CURRICULUM_ROWS.map((row) => (
          <div key={row} className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-4">
            <SkeletonBlock className="h-9 w-9 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/2 rounded-lg" />
              <SkeletonBlock className="h-3 w-2/3 rounded-lg" />
            </div>
            <SkeletonBlock className="h-5 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  )
}

function BrowseSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-11 w-full max-w-xl rounded-xl" />
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-11 w-12 rounded-full" />
          <SkeletonBlock className="h-11 w-12 rounded-full" />
          <SkeletonBlock className="h-11 w-12 rounded-full" />
          <SkeletonBlock className="h-11 w-32 rounded-xl" />
          <SkeletonBlock className="h-11 w-36 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
        {BROWSE_TILES.map((tile) => <SkeletonBlock key={tile} className="h-28 rounded-2xl" />)}
      </div>
    </div>
  )
}
