import type { Milestone } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface MilestoneListProps {
  milestones: Milestone[]
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-label block">
            Achievements
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
            Recent Milestones
          </h2>
        </div>
        <a
          href="#"
          className="text-sm font-semibold font-label text-primary hover:underline underline-offset-4 transition-all"
        >
          View All
        </a>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone) => {
          const pct = Math.min((milestone.progressValue / milestone.progressMax) * 100, 100)
          const barColor = milestone.colorClass
            .replace('text-primary', 'bg-primary')
            .replace('text-tertiary', 'bg-tertiary')
            .replace('text-secondary', 'bg-secondary')

          return (
            <div
              key={milestone.id}
              className="bg-surface-container-low p-6 rounded-xl flex items-center gap-6 group transition-all hover:bg-white hover:shadow-xl"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 duration-300 flex-shrink-0">
                <Icon name={milestone.icon} className={`text-4xl ${milestone.colorClass}`} filled />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-on-surface font-label">{milestone.title}</p>
                  <span className="text-xs font-semibold text-on-surface-variant font-label whitespace-nowrap flex-shrink-0">
                    {milestone.progressValue.toLocaleString()} / {milestone.progressMax.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant font-body">{milestone.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
