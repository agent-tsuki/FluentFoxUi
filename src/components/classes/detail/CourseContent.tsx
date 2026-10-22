import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { ClassCurriculumSection } from '@/types/classes'
import { SectionTitle } from './SectionTitle'

/** WhatYouLearn — the course's learning outcomes. */
export function WhatYouLearn({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="learn-title">
      <SectionTitle id="learn-title" icon="checklist">What you'll learn</SectionTitle>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-on-surface-variant">
            <Icon name="check_circle" className="mt-0.5 shrink-0 text-base text-success" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Curriculum — the course sections as an accordion; the first one starts open. */
export function Curriculum({ sections }: { sections: ClassCurriculumSection[] }) {
  if (sections.length === 0) return null
  return (
    <section aria-labelledby="curriculum-title">
      <SectionTitle id="curriculum-title" icon="menu_book">Curriculum</SectionTitle>
      <div className="space-y-2.5">
        {sections.map((section, i) => (
          <CurriculumItem key={section.title} section={section} index={i} />
        ))}
      </div>
    </section>
  )
}

function CurriculumItem({ section, index }: { section: ClassCurriculumSection; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const panelId = `curriculum-panel-${index}`
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/40">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 w-full items-center justify-between gap-3 bg-surface-container-lowest px-5 py-4 text-left transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
          <span className="text-sm font-semibold text-on-surface">{section.title}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden text-xs text-on-surface-variant sm:block">{section.topics.length} topics</span>
          <Icon name="expand_more" className={cn('text-xl text-on-surface-variant transition-transform duration-200', open && 'rotate-180')} />
        </span>
      </button>
      {open && (
        <ul id={panelId} className="space-y-2.5 border-t border-outline-variant/40 bg-surface-container-low px-5 py-4">
          {section.topics.map(topic => (
            <li key={topic} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
              <Icon name="check_circle" className="mt-0.5 shrink-0 text-base text-success" />
              {topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
