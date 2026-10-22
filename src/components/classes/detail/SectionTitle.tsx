import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

/** SectionTitle — the h2 + icon heading used by every course-page section. */
export function SectionTitle({ id, icon, children }: { id: string; icon: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-5 flex items-center gap-2 font-headline text-xl font-bold tracking-tight text-on-surface">
      <Icon name={icon} className="text-xl text-primary" />
      {children}
    </h2>
  )
}
