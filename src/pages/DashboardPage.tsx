import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useProgressCalendar, useProgressDashboard, useProgressOverview } from '@/hooks/useProgress'
import { streakCalendarFrom } from '@/lib/learn/progressShape'
import { PROGRESS_PATH } from '@/lib/learn/paths'
import { MasteryBars, RetentionCard } from '@/components/progress'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
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
 * /dashboard on the progress API: GET /progress/dashboard for the stats,
 * skill balance, milestones and study log; the overview for mastery per
 * track and "your recall vs target" (left out when the learner hid it);
 * the calendar for the streak calendar with goal-met days.
 */
export function DashboardPage() {
  const { user } = useAuth()
  const { data, error, refetch } = useProgressDashboard()
  const overview = useProgressOverview().data
  const calendar = useProgressCalendar().data
  const streakCalendar = useMemo(() => (calendar ? streakCalendarFrom(calendar) : data?.streakCalendar), [calendar, data])

  useEffect(() => {
    window.scrollTo(0, 0)
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
      {overview && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-surface-container-low p-6 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Eyebrow variant="plain">Mastery</Eyebrow>
                <h2 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">Where each track stands</h2>
              </div>
              <Link to={PROGRESS_PATH} className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4">
                All progress
                <Icon name="arrow_forward" className="text-base" />
              </Link>
            </div>
            <MasteryBars tracks={overview.tracks} />
          </div>
          {overview.retention && <RetentionCard retention={overview.retention} />}
        </section>
      )}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <LearningBalance balance={data.skillBalance} />
        <MilestoneList milestones={data.milestones} />
      </section>
      {data.studyLog.length > 0 && <StudyLog entries={data.studyLog} />}
      {streakCalendar && <StreakCalendar data={streakCalendar} />}
    </main>
  )
}
