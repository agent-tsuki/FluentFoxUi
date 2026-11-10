import type { ReactNode } from 'react'

/** The card used by every course-page block (What you'll learn, the sidebar cards…). */
export const DETAIL_CARD = 'rounded-xl border border-line bg-surface-raised'

/** SectionTitle — the h2 used by every course-page section. */
export function SectionTitle({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={`mb-4 font-display text-xl font-bold tracking-tight text-ink md:text-2xl ${className ?? ''}`}>
      {children}
    </h2>
  )
}
