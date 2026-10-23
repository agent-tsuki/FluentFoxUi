import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { ClassCurriculumSection } from '@/types/classes'
import { DETAIL_CARD, SectionTitle } from './SectionTitle'

/** WhatYouLearn — the course's learning outcomes, two columns from sm. */
export function WhatYouLearn({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="learn-title" className={cn(DETAIL_CARD, 'p-5 md:p-6')}>
      <SectionTitle id="learn-title">What you'll learn</SectionTitle>
      <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {items.map(item => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-on-surface md:text-base">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="check" className="text-base" />
            </span>
            <span className="pt-0.5">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Curriculum — the course sections as one numbered accordion list, all closed to start. */
export function Curriculum({ sections }: { sections: ClassCurriculumSection[] }) {
  if (sections.length === 0) return null
  return (
    <section id="curriculum" aria-labelledby="curriculum-title" className="scroll-mt-40">
      <SectionTitle id="curriculum-title">Curriculum</SectionTitle>
      <ol className={cn(DETAIL_CARD, 'divide-y divide-outline-variant/40 overflow-hidden')}>
        {sections.map((section, i) => (
          <CurriculumItem key={section.title} section={section} index={i} />
        ))}
      </ol>
    </section>
  )
}

function CurriculumItem({ section, index }: { section: ClassCurriculumSection; index: number }) {
  const [open, setOpen] = useState(false)
  const panelId = `curriculum-panel-${index}`
  const hasTopics = section.topics.length > 0
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={!hasTopics}
        aria-expanded={hasTopics ? open : undefined}
        aria-controls={hasTopics ? panelId : undefined}
        className="flex min-h-14 w-full items-center gap-4 px-4 py-3 text-left transition-colors enabled:hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:px-5"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-sm font-bold text-on-surface">{index + 1}</span>
        <span className="flex-1 text-sm font-semibold text-on-surface md:text-base">{section.title}</span>
        {hasTopics && (
          <>
            <span className="hidden text-xs text-on-surface-variant sm:block">{section.topics.length} topics</span>
            <Icon name="expand_more" className={cn('text-xl text-on-surface-variant transition-transform duration-200', open && 'rotate-180')} />
          </>
        )}
      </button>
      {open && (
        <ul id={panelId} className="space-y-2 pb-4 pl-16 pr-5">
          {section.topics.map(topic => (
            <li key={topic} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <Icon name="check" className="mt-0.5 shrink-0 text-base text-primary" />
              {topic}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
