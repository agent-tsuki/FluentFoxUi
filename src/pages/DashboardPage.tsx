import { useEffect, useState } from 'react'
import type { DashboardData } from '@/types'
import { dashboardService } from '@/api/services/dashboardService'
import { useAuth } from '@/context/AuthContext'
import {
  DashboardHero,
  StatsGrid,
  LearningBalance,
  MilestoneList,
  StudyLog,
  StreakCalendar,
} from '@/components/sections/Dashboard'

// ── Skeleton helpers ──────────────────────────────────────────────────────────
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-surface-container-high animate-pulse rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-12" aria-label="Loading dashboard…">
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

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    dashboardService.getDashboardData().then(setData)
  }, [])

  if (!data) return <DashboardSkeleton />

  return (
    <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-12">
      <DashboardHero firstName={user?.firstName ?? 'Learner'} stats={data.stats} />
      <StatsGrid stats={data.stats} />
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <LearningBalance balance={data.skillBalance} />
        <MilestoneList milestones={data.milestones} />
      </section>
      <StudyLog entries={data.studyLog} />
      <StreakCalendar data={data.streakCalendar} />
    </main>
  )
}
