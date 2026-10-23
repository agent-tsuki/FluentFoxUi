import type { ReactNode } from 'react'

/** The card used by every course-page block (What you'll learn, the sidebar cards…). */
export const DETAIL_CARD = 'rounded-2xl border border-outline-variant/50 bg-surface-container-lowest'

/** SectionTitle — the h2 used by every course-page section. */
export function SectionTitle({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={`mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl ${className ?? ''}`}>
      {children}
    </h2>
  )
}
