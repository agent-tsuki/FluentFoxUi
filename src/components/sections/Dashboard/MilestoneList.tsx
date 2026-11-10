import type { Milestone } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Eyebrow } from '@/components/ui/SectionHeader'

interface MilestoneListProps {
  milestones: Milestone[]
}

export function MilestoneList({ milestones }: MilestoneListProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <Eyebrow variant="plain">Achievements</Eyebrow>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink font-display">
          Milestones
        </h2>
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
              className="bg-surface-sunken p-6 rounded-md flex items-center gap-6 group transition-all hover:bg-surface-raised hover:shadow-elevation-2"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-surface-raised rounded-sm flex items-center justify-center shadow-elevation-1 group-hover:scale-110 duration-300 flex-shrink-0">
                <Icon name={milestone.icon} className={`text-4xl ${milestone.colorClass}`} filled />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-ink font-sans">{milestone.title}</p>
                  <span className="text-xs font-semibold text-ink-muted font-sans whitespace-nowrap flex-shrink-0">
                    {milestone.progressValue.toLocaleString()} / {milestone.progressMax.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-ink-muted font-sans">{milestone.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
