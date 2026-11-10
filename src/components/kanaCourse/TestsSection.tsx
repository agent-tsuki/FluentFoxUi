import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TestsSectionProps {
  id: string
  title: string
  description?: ReactNode
  className?: string
  /** Extra classes for the title block and the content (e.g. grid placement when the section is `display: contents`). */
  headerClassName?: string
  bodyClassName?: string
  children: ReactNode
}

/**
 * TestsSection — a titled block on the Tests and Downloads pages: plain h2,
 * one muted line, then the content. `scroll-mt-36` clears the site navbar +
 * sticky SectionNav when the section is a #hash target.
 */
export function TestsSection({ id, title, description, className, headerClassName, bodyClassName, children }: TestsSectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className={cn('scroll-mt-36', className)}>
      <div className={headerClassName}>
        <h2 id={headingId} className="font-display text-xl font-bold text-ink md:text-2xl">
          {title}
        </h2>
        {description && <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      <div className={cn('mt-4', bodyClassName)}>{children}</div>
    </section>
  )
}
