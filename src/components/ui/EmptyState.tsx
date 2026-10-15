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
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 px-6 py-16 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
        <Icon name={icon} className="text-3xl text-on-surface-variant" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
        {description && <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>}
      </div>

      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="px-5 py-2 text-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
