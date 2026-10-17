import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

interface UnitStepItemProps {
  id: string
  /** 1-based step number, shown in the marker until the step is done. */
  number: number
  title: string
  description?: ReactNode
  done: boolean
  isLast?: boolean
  children: ReactNode
}

/**
 * One step of a unit page's checklist: a numbered marker that turns into a
 * tick, a real heading (with the done state in its text), and the step body.
 * Render inside an `<ol>`.
 */
export function UnitStepItem({ id, number, title, description, done, isLast, children }: UnitStepItemProps) {
  const headingId = `step-${id}`
  return (
    <li className="relative flex gap-4 sm:gap-6">
      {/* Marker + connecting rail (decorative; the heading carries the state). */}
      <div aria-hidden className="flex flex-col items-center">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            done
              ? 'bg-primary text-on-primary dark:bg-primary-container'
              : 'border-2 border-outline-variant text-on-surface-variant bg-surface',
          )}
        >
          {done ? <Icon name="check" className="text-xl" /> : number}
        </span>
        {!isLast && <span className="mt-2 w-0.5 flex-1 rounded-full bg-outline-variant/50" />}
      </div>

      <section aria-labelledby={headingId} className={cn('min-w-0 flex-1', isLast ? 'pb-2' : 'pb-10 sm:pb-12')}>
        <h2 id={headingId} className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-headline text-xl font-bold text-on-surface">
          {title}
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              done ? 'bg-primary/10 text-primary' : 'text-on-surface-variant',
            )}
          >
            <span className="sr-only">: </span>
            {done ? 'Done' : 'To do'}
          </span>
        </h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{description}</p>}
        <div className="mt-4">{children}</div>
      </section>
    </li>
  )
}
