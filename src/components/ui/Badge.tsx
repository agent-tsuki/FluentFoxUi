import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export type BadgeTone = 'neutral' | 'done' | 'current' | 'new' | 'soon'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  done: 'bg-success-soft text-success-ink',
  current: 'bg-primary-soft text-primary-ink',
  new: 'bg-info-soft text-info-ink',
  soon: 'bg-surface-sunken text-ink-subtle',
}

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

/** Badge: a small, non-interactive status label. It always carries a word, so colour is never the only signal. */
export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-xs font-semibold', TONES[tone], className)}>
      {tone === 'done' && <Icon name="check" className="text-sm" />}
      {children}
    </span>
  )
}
