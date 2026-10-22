import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

/**
 * StatusMessage — one-line inline feedback after an action (saved, failed).
 * Errors are announced assertively (role="alert"), successes politely.
 * Renders nothing for an empty message, so it can sit in place permanently.
 */
interface StatusMessageProps {
  tone: 'error' | 'success' | 'info'
  message: string
  className?: string
}

const TONES: Record<StatusMessageProps['tone'], { box: string; icon: string }> = {
  error:   { box: 'bg-error/10 text-error',     icon: 'error' },
  success: { box: 'bg-success/10 text-success', icon: 'check_circle' },
  info:    { box: 'bg-info/10 text-info',       icon: 'info' },
}

export function StatusMessage({ tone, message, className }: StatusMessageProps) {
  if (!message) return null
  const { box, icon } = TONES[tone]
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium', box, className)}
    >
      <Icon name={icon} className="mt-px text-base" />
      <span>{message}</span>
    </p>
  )
}
