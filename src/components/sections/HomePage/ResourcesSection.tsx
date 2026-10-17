import { Link } from 'react-router-dom'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { FadeIn } from '@/components/ui/FadeIn'
import { cn } from '@/lib/cn'
import {
  RESOURCES_SECTION as COPY,
  EXTERNAL_RESOURCES,
  type ExternalResource,
  type ResourceBadgeTone,
  type ResourceTone,
} from '@/lib/content/home/resources'

const BANNER_TONE: Record<ResourceTone, string> = {
  primary: 'bg-primary/10 text-primary',
  info: 'bg-info/10 text-info',
  neutral: 'bg-surface-container text-on-surface-variant',
}

const BADGE_TONE: Record<ResourceBadgeTone, string> = {
  success: 'bg-success/10 text-success',
  info: 'bg-surface-container-lowest text-info',
  neutral: 'bg-surface-container-lowest text-on-surface-variant',
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

/**
 * ResourcesSection — home-page "Free courses hub" (id="resources"): three
 * hand-picked outside resources plus a link to the full classes list.
 * Copy and URLs live in `@/lib/content/home/resources`.
 */
export function ResourcesSection() {
  return (
    <section id="resources" aria-labelledby="resources-title" className="scroll-mt-nav px-6 py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-9">
        <FadeIn className="flex max-w-[720px] flex-col gap-3.5">
          <Eyebrow className="!mb-0">{COPY.eyebrow}</Eyebrow>
          <h2
            id="resources-title"
            className="font-headline text-display-md font-extrabold leading-[1.08] tracking-[-0.035em] text-on-surface"
          >
            {COPY.title}
          </h2>
          <p className="text-lg leading-relaxed text-on-surface-variant">{COPY.description}</p>
        </FadeIn>

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {EXTERNAL_RESOURCES.map((resource, i) => (
            <li key={resource.id} className="flex">
              <FadeIn delay={i * 80} className="flex w-full">
                <ResourceCard resource={resource} />
              </FadeIn>
            </li>
          ))}
        </ul>

        <Link
          to={COPY.browseAllTo}
          className={cn(
            'inline-flex min-h-11 items-center self-center rounded-xl px-2 py-3 text-lg font-bold text-primary hover:underline',
            FOCUS_RING,
          )}
        >
          {COPY.browseAll}
          <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </div>
    </section>
  )
}

interface ResourceCardProps {
  resource: ExternalResource
}

function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <a
      href={resource.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest transition-[border-color,box-shadow] duration-200 hover:border-outline-variant hover:shadow-elevation-1',
        FOCUS_RING,
      )}
    >
      <div className={cn('relative flex h-36 items-center justify-center', BANNER_TONE[resource.tone])}>
        <span lang="ja" aria-hidden="true" className="font-jp text-6xl font-bold">
          {resource.glyph}
        </span>
        <span
          className={cn(
            'absolute right-3.5 top-3.5 rounded-full px-2.5 py-1 text-xs font-extrabold',
            BADGE_TONE[resource.badgeTone],
          )}
        >
          {resource.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <span className="text-xs font-extrabold tracking-[0.1em] text-primary">{resource.provider}</span>
        <h3 className="font-headline text-lg font-extrabold text-on-surface">{resource.title}</h3>
        <p className="text-base leading-normal text-on-surface-variant">
          <strong className="font-bold text-on-surface">{resource.bestAt}</strong> {resource.description}
        </p>
        <span className="mt-auto pt-2 text-base font-bold text-primary group-hover:underline">
          {resource.cta}
          <span aria-hidden="true">&nbsp;→</span>
          <span className="sr-only"> {COPY.newTabHint}</span>
        </span>
      </div>
    </a>
  )
}
