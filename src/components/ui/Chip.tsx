import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'

/**
 * Chip — small status pill (e.g. CUSTOM / YOUTUBE source, invite status,
 * Published / Hidden). Semantic tones use the status tokens, so it reads the
 * same in light and dark themes.
 */
interface ChipProps {
  tone?: ChipTone
  icon?: string
  children: ReactNode
  className?: string
}

const TONES: Record<ChipTone, string> = {
  neutral: 'bg-surface-container-high text-on-surface-variant',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error:   'bg-error/10 text-error',
  info:    'bg-info/10 text-info',
}

export function Chip({ tone = 'neutral', icon, children, className }: ChipProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', TONES[tone], className)}>
      {icon && <Icon name={icon} className="text-sm" />}
      {children}
    </span>
  )
}
