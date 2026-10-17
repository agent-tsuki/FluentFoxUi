import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { UnitState } from '@/components/learn/unitStatus'

/**
 * StatusIcon — the decorative icon for a unit's state on the Course page:
 * In progress `schedule` (primary), Done `check_circle` and Tested out
 * `verified` (success). Not started has no icon; a fixed-size empty slot keeps
 * rows aligned. Always pair it with the status text.
 */
interface StatusIconProps {
  state: UnitState
  className?: string
}

const ICONS: Record<UnitState, { name: string; tone: string; filled: boolean } | null> = {
  'not-started': null,
  'in-progress': { name: 'schedule', tone: 'text-primary', filled: false },
  done: { name: 'check_circle', tone: 'text-success', filled: true },
  skipped: { name: 'verified', tone: 'text-success', filled: true },
}

export function StatusIcon({ state, className }: StatusIconProps) {
  const icon = ICONS[state]
  return (
    <span aria-hidden className={cn('flex h-6 w-6 shrink-0 items-center justify-center', className)}>
      {icon && <Icon name={icon.name} filled={icon.filled} className={cn('text-xl', icon.tone)} />}
    </span>
  )
}
