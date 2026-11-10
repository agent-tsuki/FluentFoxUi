import { Fragment, type ReactNode, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export interface Crumb {
  label: string
  /** Omit on the current page, which is the last item. */
  to?: string
}

export interface LessonMeta {
  icon: string
  label: string
}

interface LessonHeaderProps {
  crumbs: readonly Crumb[]
  title: string
  description?: ReactNode
  meta?: readonly LessonMeta[]
  /** Target for moving focus to the h1 on page change. */
  headingRef?: Ref<HTMLHeadingElement>
  className?: string
  children?: ReactNode
}

/**
 * LessonHeader: the one header of a lesson page. The breadcrumb says where the
 * learner is once (phones get that from the chapter bar instead); it stays the
 * same across a chapter's steps, so the page doesn't jump between them.
 */
export function LessonHeader({ crumbs, title, description, meta, headingRef, className, children }: LessonHeaderProps) {
  return (
    <header className={cn('grid gap-3', className)}>
      <nav aria-label="Breadcrumb" className="hidden lg:block">
        <ol className="flex flex-wrap items-center gap-1.5 text-caption text-ink-muted">
          {crumbs.map((crumb, i) => (
            <Fragment key={crumb.label}>
              {i > 0 && (
                <li aria-hidden className="text-ink-subtle">
                  /
                </li>
              )}
              <li>
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-ink hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>

      <h1 ref={headingRef} tabIndex={-1} className="font-display text-h1 text-ink focus:outline-none">
        {title}
      </h1>

      {description && <p className="max-w-reading text-body-lg text-ink-muted">{description}</p>}

      {meta && meta.length > 0 && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-ink-muted">
          {meta.map((m) => (
            <li key={m.label} className="inline-flex items-center gap-1.5">
              <Icon name={m.icon} className="text-base" />
              {m.label}
            </li>
          ))}
        </ul>
      )}

      {children}
    </header>
  )
}
