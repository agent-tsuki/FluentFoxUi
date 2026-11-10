import type { ReactNode } from 'react'

/** Titled surface section used on every admin screen. */
export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="space-y-4 rounded-xl border border-line bg-surface-sunken p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}
