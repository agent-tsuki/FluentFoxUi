import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export type CalloutTone = 'rule' | 'note' | 'culture' | 'warning'

const TONES: Record<CalloutTone, { box: string; icon: string }> = {
  rule: { box: 'bg-primary-soft text-primary-ink', icon: 'lightbulb' },
  note: { box: 'bg-info-soft text-info-ink', icon: 'info' },
  culture: { box: 'bg-leaf-soft text-leaf-ink', icon: 'public' },
  warning: { box: 'bg-warning-soft text-warning-ink', icon: 'warning' },
}

interface CalloutProps {
  tone: CalloutTone
  title: string
  children: ReactNode
  className?: string
}

/** Callout: a flat tinted aside. Icon and title always appear, so tone is never carried by colour alone. */
export function Callout({ tone, title, children, className }: CalloutProps) {
  const { box, icon } = TONES[tone]
  return (
    <aside className={cn('grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-lg py-4 pl-4 pr-6', box, className)}>
      <Icon name={icon} className="mt-0.5 text-xl" />
      <p className="text-label font-bold">{title}</p>
      <div className="col-start-2 text-body">{children}</div>
    </aside>
  )
}
