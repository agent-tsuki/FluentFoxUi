import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { formatPercent } from './testsPercent'

interface TestsStatusProps {
  /** Best score so far, 0–1; undefined when the test hasn't been taken. */
  best?: number
  passed: boolean
  className?: string
}

/**
 * TestsStatus — a test's result as icon + text (never colour alone):
 * "Passed · 95 %" in the success token, "Best 70 %", or "Not taken".
 */
export function TestsStatus({ best, passed, className }: TestsStatusProps) {
  if (passed) {
    return (
      <span className={cn('inline-flex items-center gap-1 whitespace-nowrap text-sm', className)}>
        <span aria-hidden className="flex">
          <Icon name="check_circle" filled className="text-lg text-success" />
        </span>
        <span className="font-semibold text-success">Passed</span>
        {best !== undefined && <span className="tabular-nums text-on-surface-variant">· {formatPercent(best)}</span>}
      </span>
    )
  }
  return (
    <span className={cn('whitespace-nowrap text-sm tabular-nums text-on-surface-variant', className)}>
      {best !== undefined ? `Best ${formatPercent(best)}` : 'Not taken'}
    </span>
  )
}
