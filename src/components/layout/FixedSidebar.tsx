import type { ReactNode } from 'react'
import { useFooterOverlap } from '@/hooks/useFooterOverlap'
import { cn } from '@/lib/cn'

/** Offset for the page content beside a FixedSidebar (its width, inset and gap). */
export const FIXED_SIDEBAR_OFFSET = 'lg:ml-80'

/**
 * FixedSidebar — the desktop (lg+) side navigation shared by the grammar course
 * and the dashboard: a rounded card floating at the left under the navbar that
 * stays put while the page scrolls. When the footer scrolls into view it pushes
 * the whole card up (same size), so the card slides away under the navbar
 * instead of being covered by the footer. Put the scrolling part in a
 * `flex-1 overflow-y-auto` child and keep header/footer `flex-shrink-0`.
 */
export function FixedSidebar({ className, children }: { className?: string; children: ReactNode }) {
  const footerOverlap = useFooterOverlap()
  return (
    <aside
      className={cn(
        'fixed left-4 top-[calc(theme(spacing.nav)+0.75rem)] z-10 hidden w-72 flex-col overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-elevation-1 lg:flex',
        className,
      )}
      style={{ bottom: '1rem', transform: footerOverlap > 0 ? `translateY(-${footerOverlap}px)` : undefined }}
    >
      {children}
    </aside>
  )
}
