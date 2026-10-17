import type { UnitStep } from '@/api/services/learningPathService'
import { cn } from '@/lib/cn'

interface StepProgressProps {
  steps: UnitStep[]
  done: Record<UnitStep, boolean>
  completed: number
  className?: string
}

/** "3 of 5 steps" with one small segment per step. The segments are decorative; the text carries the meaning. */
export function StepProgress({ steps, done, completed, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span aria-hidden className="flex flex-1 gap-1">
        {steps.map((step) => (
          <span
            key={step}
            className={cn('h-1.5 flex-1 rounded-full', done[step] ? 'bg-primary' : 'bg-outline-variant/60')}
          />
        ))}
      </span>
      <span className="shrink-0 text-xs font-medium text-on-surface-variant">
        {completed} of {steps.length} steps
      </span>
    </div>
  )
}
