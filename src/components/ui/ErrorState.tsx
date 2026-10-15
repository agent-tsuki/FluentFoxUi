import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

/**
 * ErrorState — friendly, on-brand fallback for a failed async fetch. Pass `onRetry`
 * to render a retry action; omit it when there's nothing to re-run. Use this instead
 * of leaving a page stuck on a skeleton or logging silently to the console.
 */
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this. Please try again.",
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center gap-4 px-6 py-16 text-center', className)}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <Icon name="error" className="text-3xl text-error" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">{message}</p>
      </div>

      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="flex items-center gap-2 px-5 py-2 text-sm">
          <Icon name="refresh" className="text-base" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
