import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { UNIT_STATE_LABEL, type UnitStatusSummary } from '@/components/learn/unitStatus'

/**
 * A unit's status as icon + text (never colour alone): Not started (text only),
 * In progress (schedule, primary, "x of y steps"), Done (check_circle, success),
 * Tested out (verified, success).
 */
export function UnitStatusLine({ status, className }: { status: UnitStatusSummary; className?: string }) {
  const { state, completed, total } = status
  const icon = state === 'in-progress' ? 'schedule' : state === 'done' ? 'check_circle' : state === 'skipped' ? 'verified' : null
  const tone = state === 'in-progress' ? 'text-primary' : 'text-success'
  return (
    <span className={cn('flex items-center gap-1 text-xs tabular-nums text-on-surface-variant', className)}>
      {icon && (
        <span aria-hidden className="flex">
          <Icon name={icon} filled={state !== 'in-progress'} className={cn('text-base', tone)} />
        </span>
      )}
      {state === 'in-progress' ? `${UNIT_STATE_LABEL[state]} · ${completed} of ${total} steps` : UNIT_STATE_LABEL[state]}
    </span>
  )
}
