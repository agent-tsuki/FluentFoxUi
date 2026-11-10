import type { ReactNode } from 'react'
import { ActionLink } from '@/components/learn/ActionLink'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

interface ContinueBarProps {
  title: string
  /** Step position and size, e.g. "Step 2 of 4 · 25 words". */
  subtitle?: string
  action: { label: string; to: string }
  skip?: { label: string; to: string }
  /** Anything else offered beside the primary button, e.g. "Save your progress". */
  extra?: ReactNode
  /** The step's own task is still the main action, so going on is not the primary button yet. */
  quiet?: boolean
  className?: string
}

/**
 * ContinueBar: the end of a lesson step, with one sentence about what comes
 * next and the page's one primary button. Inline, never sticky, so it doesn't
 * cost phones any screen. It stacks with a full-width button on small screens.
 */
export function ContinueBar({ title, subtitle, action, skip, extra, quiet, className }: ContinueBarProps) {
  return (
    <div className={cn('flex flex-col gap-4 rounded-xl bg-surface-raised px-6 py-4 shadow-elevation-2 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <p className="font-display text-base font-bold text-ink">{title}</p>
        {subtitle && <p className="text-caption text-ink-muted">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {skip && (
          <ActionLink to={skip.to} variant="ghost">
            {skip.label}
          </ActionLink>
        )}
        {extra}
        <ActionLink to={action.to} variant={quiet ? 'secondary' : 'primary'} size={quiet ? 'md' : 'lg'}>
          {action.label}
          <Icon name="arrow_forward" className="text-xl" />
        </ActionLink>
      </div>
    </div>
  )
}
