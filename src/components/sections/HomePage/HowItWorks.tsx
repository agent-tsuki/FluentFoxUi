import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import {
  CLASS_DIRECTORY,
  HOW_IT_WORKS_CLOSING,
  HOW_IT_WORKS_INTRO,
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from '@/lib/content/home/howItWorks'
import { GrammarDemo, KanaDemo, KanjiDemo, ReviewDemo } from './howItWorksDemos'

/**
 * "How FoxSensei works": the four steps a learner actually takes (kana → kanji →
 * N5 grammar → review), each with a tiny local demo. Demos are illustrative only
 * and never touch learner progress.
 */
export function HowItWorks() {
  return (
    <section id="journey" aria-labelledby="how-title" className="scroll-mt-nav mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:py-28">
      <header className="max-w-2xl">
        <p className="concept-eyebrow">{HOW_IT_WORKS_INTRO.eyebrow}</p>
        <h2 id="how-title" className="concept-section-title mt-4">
          {HOW_IT_WORKS_INTRO.title}
        </h2>
        <p className="mt-5 max-w-prose text-base leading-7 text-home-muted">{HOW_IT_WORKS_INTRO.body}</p>
      </header>

      <ol className="ml-[1.125rem] mt-14 space-y-16 border-l border-home-line pl-8 md:ml-0 md:border-l-0 md:pl-0 lg:space-y-24">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <StepRow key={step.number} step={step} demo={DEMOS[index]} />
        ))}
      </ol>

      <p className="mt-20 flex flex-wrap items-center gap-x-3 border-t border-home-line pt-8 text-base text-home-muted">
        {CLASS_DIRECTORY.lead}
        <ArrowLink to={CLASS_DIRECTORY.link.to}>{CLASS_DIRECTORY.link.label}</ArrowLink>
      </p>

      <div className="mt-20 text-center">
        <h2 className="concept-section-title">{HOW_IT_WORKS_CLOSING.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-home-muted">{HOW_IT_WORKS_CLOSING.body}</p>
        <Link
          to={HOW_IT_WORKS_CLOSING.cta.to}
          className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-home-accent px-7 py-3 text-sm font-bold text-home-on-accent shadow-elevation-2 transition duration-200 hover:bg-home-accent-hover motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-home-accent"
        >
          {HOW_IT_WORKS_CLOSING.cta.label}
          <Icon name="arrow_forward" className="text-lg transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  )
}

const StepRow = memo(function StepRow({ step, demo }: { step: HowItWorksStep; demo: ReactNode }) {
  const titleId = `how-step-${step.number}`
  return (
    <li aria-labelledby={titleId} className="relative md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center md:gap-12">
      <div>
        {/* The number sits on the hairline on mobile and leads the label from md up. */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="-ml-[3.25rem] grid size-9 shrink-0 place-items-center rounded-full border border-home-line-strong bg-home-canvas text-sm font-semibold text-home-ink md:ml-0"
          >
            {step.number}
          </span>
          <p className="concept-label">{step.label}</p>
        </div>
        <h3 id={titleId} className="concept-step-title mt-4">
          {step.title}
        </h3>
        <p className="mt-4 max-w-prose text-base leading-7 text-home-muted">{step.body}</p>
        {step.meta && <p className="mt-2 text-sm text-home-muted">{step.meta}</p>}
        <div className="mt-3 flex flex-wrap gap-x-6">
          {step.links.map((link) => (
            <ArrowLink key={link.to} to={link.to}>{link.label}</ArrowLink>
          ))}
        </div>
      </div>

      {/* On mobile the panel steps out of the timeline indent so the demo gets the full width. */}
      <div className="concept-demo -ml-8 mt-8 md:ml-0 md:mt-0">
        <p className="concept-label">{step.demoLabel}</p>
        <div className="mt-6 text-center">{demo}</div>
      </div>
    </li>
  )
})

function ArrowLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`concept-step-link group ${className}`}>
      <span className="concept-step-link-text">{children}</span>
      <Icon name="arrow_forward" className="text-base transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
    </Link>
  )
}

const DEMOS: readonly ReactNode[] = [<KanaDemo key="kana" />, <KanjiDemo key="kanji" />, <GrammarDemo key="grammar" />, <ReviewDemo key="review" />]
