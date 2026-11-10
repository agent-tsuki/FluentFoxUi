import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export const GRAMMAR_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const
/** Levels whose content isn't published yet (shown with a lock, not clickable). */
export const LOCKED_GRAMMAR_LEVELS: ReadonlySet<string> = new Set(['n4', 'n3', 'n2', 'n1'])

type LevelSwitcherSize = 'sm' | 'md'

interface LevelSwitcherProps {
  level: string
  /** `sm` — compact desktop sidebar. `md` — 44px touch targets for phones. */
  size?: LevelSwitcherSize
  className?: string
}

const SEGMENT_SIZE: Record<LevelSwitcherSize, string> = {
  sm: 'min-h-9',
  md: 'min-h-11',
}

/**
 * LevelSwitcher — segmented N5…N1 control for the grammar course.
 * Used by the desktop GrammarSidebar and the phone MobileGrammarNav.
 * Locked levels render as non-interactive segments with a lock icon.
 */
export function LevelSwitcher({ level, size = 'sm', className }: LevelSwitcherProps) {
  const current = level.toLowerCase()

  return (
    <div
      role="group"
      aria-label="JLPT level"
      className={cn('grid grid-cols-5 gap-1 p-1 bg-surface-sunken rounded-md', className)}
    >
      {GRAMMAR_LEVELS.map(l => {
        const label = l.toUpperCase()
        if (LOCKED_GRAMMAR_LEVELS.has(l)) {
          return (
            <div
              key={l}
              title={`${label}: coming soon`}
              className={cn(
                'relative rounded-sm text-xs font-bold flex items-center justify-center gap-0.5 cursor-not-allowed text-ink-subtle select-none',
                SEGMENT_SIZE[size],
              )}
            >
              <Icon name="lock" className="text-xs leading-none" />
              <span aria-hidden>{label}</span>
              <span className="sr-only">{label}, coming soon</span>
            </div>
          )
        }

        const isActive = current === l
        return (
          <Link
            key={l}
            to={`/grammar/${l}/1`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-sm text-xs font-bold flex items-center justify-center transition-all duration-200',
              'outline-none focus-visible:ring-2 focus-visible:ring-primary',
              SEGMENT_SIZE[size],
              isActive
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
