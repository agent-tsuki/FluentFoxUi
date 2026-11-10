import { Link, NavLink } from 'react-router-dom'
import { useReviewGate } from '@/hooks/useReviewGate'
import { FixedSidebar } from '@/components/layout/FixedSidebar'
import { Icon } from '@/components/ui/Icon'
import { StreakFire } from '@/components/ui/StreakFire'
import { cn } from '@/lib/cn'
import { DASHBOARD_SECTIONS, dashboardSectionPath } from '@/lib/dashboard/sections'
import { reviewPath } from '@/lib/learn/paths'

interface DashboardSidebarProps {
  /** Reviews due now; null while loading. */
  dueNow: number | null
  streak: number | null
}

/**
 * The dashboard's own navigation from lg up, in the shared FixedSidebar card
 * (like the grammar course): it stays put while the page scrolls and ends
 * above the footer. The section list scrolls inside it when space is short;
 * the streak and review shortcut stay pinned to its foot.
 */
export function DashboardSidebar({ dueNow, streak }: DashboardSidebarProps) {
  const gateReview = useReviewGate()
  return (
    <FixedSidebar>
      <div className="flex-shrink-0 border-b border-line px-5 pb-4 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Dashboard</p>
        <p className="mt-1 text-sm text-ink-muted">Your progress, in detail.</p>
      </div>

      <nav aria-label="Dashboard" className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {DASHBOARD_SECTIONS.map((s) => (
            <li key={s.path}>
              <NavLink
                to={dashboardSectionPath(s)}
                end={s.path === ''}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive ? 'bg-primary/10 text-primary' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={s.icon} filled={isActive} className="text-xl" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{s.label}</span>
                      <span className={cn('block truncate text-xs', isActive ? 'text-primary/80' : 'text-ink-muted')}>{s.hint}</span>
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-shrink-0 space-y-3 border-t border-line p-4">
        <div className="flex items-center gap-2">
          <StreakFire lit={(streak ?? 0) > 0} className="text-xl" />
          <p className="text-sm text-ink-muted">
            <span className="font-bold tabular-nums text-ink">{streak ?? '–'}</span> day streak
          </p>
        </div>
        <Link
          to={reviewPath()}
          onClick={gateReview()}
          className="flex min-h-11 items-center justify-between rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {dueNow ? `Review ${dueNow} due` : 'Open reviews'}
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
      </div>
    </FixedSidebar>
  )
}

/** Below lg: the same sections as a sticky row of scrollable tabs under the navbar. */
export function DashboardTabs() {
  return (
    <nav
      aria-label="Dashboard"
      className="sticky top-nav z-20 -mx-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden"
    >
      <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {DASHBOARD_SECTIONS.map((s) => (
          <li key={s.path} className="shrink-0">
            <NavLink
              to={dashboardSectionPath(s)}
              end={s.path === ''}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-sm font-semibold transition-colors',
                  isActive ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink',
                )
              }
            >
              <Icon name={s.icon} className="text-lg" />
              {s.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
