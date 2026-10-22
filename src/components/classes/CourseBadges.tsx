import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { PLATFORM_META } from '@/lib/classes/platformMeta'
import type { ClassPlatform } from '@/types/classes'

const BADGE = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide'

/** PlatformBadge — YouTube / Udemy / Website pill. */
export function PlatformBadge({ platform, className }: { platform: ClassPlatform; className?: string }) {
  const meta = PLATFORM_META[platform]
  return (
    <span className={cn(BADGE, meta.colorClass, meta.tintClass, className)}>
      <Icon name={meta.icon} className="text-sm" />
      {meta.label}
    </span>
  )
}

/** PriceBadge — "Free" or "Paid" pill, in the semantic status tokens. */
export function PriceBadge({ isFree, className }: { isFree: boolean; className?: string }) {
  return (
    <span className={cn(BADGE, isFree ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning', className)}>
      {isFree ? 'Free' : 'Paid'}
    </span>
  )
}

/** LevelBadge — JLPT level pill. */
export function LevelBadge({ level, className }: { level: string; className?: string }) {
  return <span className={cn(BADGE, 'bg-primary/10 text-primary', className)}>JLPT {level}</span>
}

/** TagList — topic chips; `max` trims long lists on cards. */
export function TagList({ tags, max, className }: { tags: string[]; max?: number; className?: string }) {
  const shown = max ? tags.slice(0, max) : tags
  if (shown.length === 0) return null
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Topics">
      {shown.map(tag => (
        <li
          key={tag}
          className="rounded-full border border-outline-variant/40 bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}
