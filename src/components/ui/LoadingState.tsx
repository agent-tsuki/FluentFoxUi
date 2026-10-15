import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * LoadingState — accessible placeholder for an in-flight async view. Pass `children`
 * composed of <SkeletonBlock>s that mirror the real layout (see DashboardPage's
 * DashboardSkeleton for the reference shape); omit `children` for a generic 3-line
 * skeleton. Always prefer this over a bare spinner, `null`, or "loading..." text.
 */
interface LoadingStateProps {
  /** Screen-reader label announced while loading. */
  label?: string
  className?: string
  children?: ReactNode
}

export function LoadingState({ label = 'Loading…', className, children }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className={cn('w-full', className)}>
      <span className="sr-only">{label}</span>
      {children ?? <DefaultSkeleton />}
    </div>
  )
}

interface SkeletonBlockProps {
  className?: string
}

/**
 * SkeletonBlock — single shimmering placeholder rectangle. Compose several inside
 * <LoadingState> to mirror the real content shape. Has no default border-radius —
 * always pass one explicitly (`rounded-xl` for panels, `rounded-full` for
 * avatars/circles) since utility classes here are not de-duplicated by `cn()`.
 */
export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={cn('bg-surface-container-high animate-shimmer', className)} aria-hidden="true" />
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-6 w-2/3 rounded-xl" />
      <SkeletonBlock className="h-4 w-full rounded-xl" />
      <SkeletonBlock className="h-4 w-5/6 rounded-xl" />
    </div>
  )
}
