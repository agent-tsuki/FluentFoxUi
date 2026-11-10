import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { TestsStatus } from './TestsStatus'

/** The bordered, divided list that holds TestsRow / download rows. */
export const TESTS_LIST =
  'divide-y divide-line overflow-hidden rounded-xl bg-surface-raised shadow-elevation-1 dark:divide-line-strong/40'

interface TestsRowProps {
  to: string
  /** Small leading mark: a unit number or an icon. Decorative. */
  leading: ReactNode
  title: ReactNode
  detail?: ReactNode
  best?: number
  passed: boolean
}

/**
 * TestsRow — one test in a TESTS_LIST: leading mark, title + detail, status
 * (icon + text) and a chevron. The whole row is the link to the test.
 */
export const TestsRow = memo(function TestsRow({ to, leading, title, detail, best, passed }: TestsRowProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex min-h-16 items-center gap-3 px-3 py-3 text-left transition-colors duration-150 sm:gap-4 sm:px-4',
        'hover:bg-surface-hover dark:hover:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
      )}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-sm font-bold tabular-nums text-ink-muted dark:bg-surface-hover"
      >
        {leading}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold leading-snug text-ink">{title}</span>
        {detail && <span className="block truncate text-xs text-ink-muted">{detail}</span>}
      </span>
      <TestsStatus best={best} passed={passed} className="shrink-0" />
      <span aria-hidden className="-mr-1 flex shrink-0">
        <Icon
          name="chevron_right"
          className="text-xl text-ink-muted transition-transform motion-safe:group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  )
})
