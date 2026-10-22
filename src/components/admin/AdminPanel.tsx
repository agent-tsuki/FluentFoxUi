import type { ReactNode } from 'react'

/** Titled surface section used on every admin screen. */
export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-5 sm:p-6">
      <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
      {children}
    </section>
  )
}
