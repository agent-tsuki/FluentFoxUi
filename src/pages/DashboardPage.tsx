import { useCallback, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { LearningTrack } from '@/types/learn'
import {
  useConfusions,
  useProgressCalendar,
  useProgressDashboard,
  useProgressForecast,
  useProgressOverview,
  useWeakGroups,
  useWeakItems,
} from '@/hooks/useProgress'
import { streakCalendarFrom } from '@/lib/learn/progressShape'
import { HOW_GRADING_WORKS_PATH, isLearningTrack } from '@/lib/learn/paths'
import {
  ConfusionList,
  ForecastChart,
  MasteryBars,
  ProgressSection,
  RetentionCard,
  TrackFilter,
  WeakGroupsList,
  WeakItemsList,
} from '@/components/progress'
import { Eyebrow } from '@/components/ui/SectionHeader'
import {
  DashboardHero,
  StatsGrid,
  LearningBalance,
  MilestoneList,
  StudyLog,
  StreakCalendar,
} from '@/components/sections/Dashboard'
import { ErrorState } from '@/components/ui/ErrorState'
import { TodayPanel } from '@/components/learnSession/TodayPanel'

const FORECAST_DAYS = 14
const WEAK_ITEMS_LIMIT = 20
const CONFUSIONS_LIMIT = 10

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <main className="pt-nav pb-20 px-6 max-w-6xl mx-auto space-y-12" aria-label="Loading dashboard…">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-5 w-80" />
      </div>

      {/* Stats grid skeleton — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32" />
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>

      {/* Study log skeleton */}
      <div className="space-y-3">
        <SkeletonBlock className="h-6 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16" />
        ))}
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * The learner's single home for daily activity and longer-term progress.
 * Dashboard data, mastery, forecast and weak-item hooks all start together,
 * while each detailed progress section handles its own loading/error state.
 */
export function DashboardPage() {
  const { user } = useAuth()
  const { data, error, refetch } = useProgressDashboard()
  const [params, setParams] = useSearchParams()
  const rawTrack = params.get('track')
  const track: LearningTrack | undefined = isLearningTrack(rawTrack) ? rawTrack : undefined
  const setTrack = useCallback(
    (next: LearningTrack | undefined) =>
      setParams((previous) => {
        const nextParams = new URLSearchParams(previous)
        if (next) nextParams.set('track', next)
        else nextParams.delete('track')
        return nextParams
      }, { replace: true }),
    [setParams],
  )

  const overview = useProgressOverview()
  const calendar = useProgressCalendar()
  const forecast = useProgressForecast(FORECAST_DAYS)
  const weakItems = useWeakItems(track, WEAK_ITEMS_LIMIT)
  const weakGroups = useWeakGroups(track)
  const confusions = useConfusions(track, CONFUSIONS_LIMIT)
  const streakCalendar = useMemo(
    () => (calendar.data ? streakCalendarFrom(calendar.data) : data?.streakCalendar),
    [calendar.data, data],
  )
  const trackFilter = <TrackFilter value={track} onChange={setTrack} />

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Dashboard · FoxSensei'
  }, [])

  if (error) {
    return (
      <main className="pt-nav pb-20 px-6 max-w-6xl mx-auto">
        <ErrorState message="We couldn't load your dashboard." onRetry={refetch} />
      </main>
    )
  }

  if (!data) return <DashboardSkeleton />

  return (
    <main className="pt-nav pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      <DashboardHero firstName={user?.firstName ?? 'Learner'} stats={data.stats} />
      <TodayPanel />
      <StatsGrid stats={data.stats} />
      {overview.data && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-surface-container-low p-6 space-y-5">
            <div>
              <Eyebrow variant="plain">Mastery</Eyebrow>
              <h2 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">Where each track stands</h2>
            </div>
            <MasteryBars tracks={overview.data.tracks} />
          </div>
          {overview.data.retention && <RetentionCard retention={overview.data.retention} />}
        </section>
      )}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <LearningBalance balance={data.skillBalance} />
        <MilestoneList milestones={data.milestones} />
      </section>
      {data.studyLog.length > 0 && <StudyLog entries={data.studyLog} />}
      {streakCalendar && <StreakCalendar data={streakCalendar} />}

      <section aria-labelledby="progress-insights-title" className="space-y-14 pt-4">
        <header className="space-y-2">
          <Eyebrow variant="plain">Progress insights</Eyebrow>
          <h2 id="progress-insights-title" className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            A closer look at your learning
          </h2>
          <p className="max-w-prose text-on-surface-variant">
            Levels come from how long you remember each card.{' '}
            <Link to={HOW_GRADING_WORKS_PATH} className="font-semibold text-primary hover:underline underline-offset-4">
              How grading works
            </Link>
          </p>
        </header>

        <ProgressSection
          id="forecast"
          eyebrow="Coming up"
          title="Review forecast"
          description="Reviews due each day for the next two weeks."
          state={forecast}
          actions={trackFilter}
          isEmpty={(value) => value.days.length === 0}
          empty={{ icon: 'event_available', title: 'No reviews scheduled', description: 'Learn something new and its reviews appear here.' }}
        >
          {(value) => <ForecastChart days={value.days} track={track} className="rounded-xl bg-surface-container-low p-6" />}
        </ProgressSection>

        <ProgressSection
          id="weak"
          eyebrow="Needs work"
          title="Weak items"
          description="The cards you find hardest right now, and why."
          state={weakItems}
          actions={trackFilter}
          isEmpty={(items) => items.length === 0}
          empty={{ icon: 'verified', title: 'No weak items', description: 'Nothing stands out yet. Keep reviewing and this list fills in where you struggle.' }}
        >
          {(items) => <WeakItemsList items={items} />}
        </ProgressSection>

        <ProgressSection
          id="weak-groups"
          eyebrow="Needs work"
          title="Weak groups"
          description="Units and kana groups you miss more often than usual."
          state={weakGroups}
          isEmpty={(groups) => groups.length === 0}
          empty={{ icon: 'grid_view', title: 'No weak groups', description: 'Every group is at or above your average.' }}
        >
          {(groups) => <WeakGroupsList groups={groups} />}
        </ProgressSection>

        <ProgressSection
          id="mix-ups"
          eyebrow="Look-alikes"
          title="Mix-ups"
          description="Pairs you confuse most. Tap one to drill just that pair."
          state={confusions}
          actions={trackFilter}
          isEmpty={(pairs) => pairs.length === 0}
          empty={{ icon: 'compare_arrows', title: 'No mix-ups yet', description: 'When you pick one character for another, the pair shows up here.' }}
        >
          {(pairs) => <ConfusionList pairs={pairs} />}
        </ProgressSection>

      </section>
    </main>
  )
}
