import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TestsSectionProps {
  id: string
  title: string
  description?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * TestsSection — a titled block on the Tests and Downloads pages: plain h2,
 * one muted line, then the content. `scroll-mt-36` clears the site navbar +
 * sticky SectionNav when the section is a #hash target.
 */
export function TestsSection({ id, title, description, className, children }: TestsSectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className={cn('scroll-mt-36', className)}>
      <h2 id={headingId} className="font-headline text-xl font-bold text-on-surface md:text-2xl">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-prose text-sm leading-relaxed text-on-surface-variant">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
