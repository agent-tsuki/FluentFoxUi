import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

/**
 * EmptyState — designed placeholder for a successfully-loaded but empty result
 * (e.g. a filtered list with no matches). Pass `actionLabel` + `onAction` for an
 * optional next step; omit both to show just the icon + copy.
 */
interface EmptyStateProps {
  icon?: string
  /** A Japanese character shown in place of the icon. */
  glyph?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = 'inbox',
  glyph,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 px-6 py-16 text-center', className)}>
      <div className="grid size-16 place-items-center rounded-full bg-surface-sunken">
        {glyph ? (
          <span aria-hidden lang="ja" className="font-ja-display text-3xl font-bold text-ink-muted">
            {glyph}
          </span>
        ) : (
          <Icon name={icon} className="text-3xl text-ink-muted" />
        )}
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
        {description && <p className="text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>

      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="px-5 py-2 text-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
