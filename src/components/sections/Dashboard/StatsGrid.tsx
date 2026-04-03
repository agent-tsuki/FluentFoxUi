import type { DashboardStats } from '@/types'

interface StatsGridProps {
  stats: DashboardStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cells = [
    {
      label: 'Total Focus',
      value: `${stats.studyHours.toLocaleString()}h`,
      sub: 'Study hours recorded',
      accent: false,
    },
    {
      label: 'Active Review',
      value: stats.cardsReviewed.toLocaleString(),
      sub: 'SRS cards reviewed',
      accent: false,
    },
    {
      label: 'Session Rank',
      value: stats.globalRank,
      sub: 'Global monthly rank',
      accent: true,
    },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={`bg-surface-container-low p-8 rounded-xl space-y-1 ${
            cell.accent ? 'border-b-4 border-primary' : ''
          }`}
        >
          <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest font-label">
            {cell.label}
          </span>
          <p className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
            {cell.value}
          </p>
          <p className="text-xs text-on-surface-variant font-body">{cell.sub}</p>
        </div>
      ))}
    </section>
  )
}
