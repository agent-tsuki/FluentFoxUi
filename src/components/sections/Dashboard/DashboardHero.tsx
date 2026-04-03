import type { DashboardStats } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface DashboardHeroProps {
  firstName: string
  stats: DashboardStats
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardHero({ firstName, stats }: DashboardHeroProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Left: greeting + meta chips */}
      <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-label">
            Study Dashboard
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            {greeting()}, {firstName}.
          </h1>
          <p className="text-on-surface-variant font-body max-w-md">
            Here's a snapshot of your Japanese learning journey. Keep the streak alive!
          </p>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-3">
          <Chip icon="local_fire_department" label={`${stats.currentStreak} day streak`} accent />
          <Chip icon="stars" label={`Targeting JLPT ${stats.targetLevel}`} />
          <Chip icon="emoji_events" label={stats.globalRank} />
        </div>
      </div>

      {/* Right: JLPT progress card (dark, like QuizConfig summary) */}
      <div className="bg-on-surface text-inverse-on-surface rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-on-surface/10">
        <div className="relative z-10 space-y-2">
          <h3 className="font-headline font-bold text-xl">Mastery Progress</h3>
          <p className="text-white/60 text-sm font-body">Your journey to JLPT {stats.targetLevel}</p>
        </div>

        <div className="relative z-10 space-y-4 mt-6">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-extrabold tracking-tight">{stats.jlptProgress}%</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              JLPT {stats.targetLevel} Goal
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${stats.jlptProgress}%` }}
            />
          </div>
        </div>

        {/* Decorative ring */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border-[20px] border-white/5 pointer-events-none" />
      </div>
    </section>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ icon, label, accent = false }: { icon: string; label: string; accent?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-label ${
        accent
          ? 'bg-primary text-on-primary shadow-sm shadow-primary/20'
          : 'bg-surface-container-highest text-on-surface'
      }`}
    >
      <Icon name={icon} className="text-base" filled={accent} />
      {label}
    </div>
  )
}
