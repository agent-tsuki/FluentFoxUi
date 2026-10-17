import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { cn } from '@/lib/cn'

interface ProgressSectionProps<T> {
  id: string
  eyebrow: string
  title: string
  description?: string
  /** One data hook's state. */
  state: { data: T | undefined; isLoading: boolean; error: Error | null; refetch: () => void }
  isEmpty: (data: T) => boolean
  empty: { icon: string; title: string; description: string }
  /** Extra controls next to the heading (filters). */
  actions?: ReactNode
  className?: string
  children: (data: T) => ReactNode
}

/**
 * ProgressSection — one block of the progress page with its own heading and
 * its own loading, error and empty states, so one slow or failing endpoint
 * never blanks the others.
 */
export function ProgressSection<T>({ id, eyebrow, title, description, state, isEmpty, empty, actions, className, children }: ProgressSectionProps<T>) {
  const { data, isLoading, error, refetch } = state
  let body: ReactNode
  if (error) body = <ErrorState message={`We couldn't load ${title.toLowerCase()}.`} onRetry={refetch} className="py-10" />
  else if (isLoading || data === undefined) {
    body = (
      <LoadingState label={`Loading ${title.toLowerCase()}…`}>
        <SkeletonBlock className="h-32 w-full rounded-xl" />
      </LoadingState>
    )
  } else if (isEmpty(data)) body = <EmptyState {...empty} className="py-10" />
  else body = children(data)

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-nav space-y-5', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Eyebrow variant="plain">{eyebrow}</Eyebrow>
          <h2 id={`${id}-title`} className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            {title}
          </h2>
          {description && <p className="max-w-prose text-sm text-on-surface-variant">{description}</p>}
        </div>
        {actions}
      </div>
      {body}
    </section>
  )
}
