import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { FadeIn } from '@/components/ui/FadeIn'
import { cn } from '@/lib/cn'
import { swapVariants } from '@/lib/motion'
import { useStartLearning } from '@/hooks/useStartLearning'
import {
  DEFAULT_LEVEL,
  FIRST_WEEK_PLANS,
  LEVEL_OPTIONS,
  LEVEL_PICKER_COPY as COPY,
  type LevelId,
} from '@/lib/content/home/levels'
import { JaText } from './JaText'

const CARD_STATE = {
  selected: 'border-primary bg-primary/5 shadow-elevation-2',
  idle: 'border-outline-variant bg-surface-container-lowest hover:border-primary/70',
} as const

/**
 * LevelPicker — homepage "Start where you are" section (#start). Three level cards act as a
 * single-select toggle group; the "Your first week" panel swaps to the chosen level's plan.
 */
export function LevelPicker() {
  const [level, setLevel] = useState<LevelId>(DEFAULT_LEVEL)
  const { startLearning, prefetch } = useStartLearning()
  const reducedMotion = useReducedMotion()
  const plan = FIRST_WEEK_PLANS[level]

  return (
    <section
      id="start"
      aria-labelledby="level-picker-title"
      className="scroll-mt-nav bg-surface-container-lowest border-y border-outline-variant/60"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24 flex flex-col gap-9">
        <FadeIn className="flex flex-col max-w-3xl">
          {/* Eyebrow carries mb-2; h2/p margins complete the mockup's 14px rhythm. */}
          <Eyebrow>{COPY.eyebrow}</Eyebrow>
          <h2
            id="level-picker-title"
            className="mt-1.5 font-headline text-display-md font-extrabold tracking-tight text-on-surface"
          >
            {COPY.title}
          </h2>
          <p className="mt-3.5 font-body text-lg leading-relaxed text-on-surface-variant">{COPY.description}</p>
        </FadeIn>

        <FadeIn delay={100}>
          <div role="group" aria-label={COPY.groupLabel} className="grid gap-4 md:grid-cols-3">
            {LEVEL_OPTIONS.map(opt => {
              const selected = opt.id === level
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setLevel(opt.id)}
                  className={cn(
                    'min-h-11 min-w-0 flex flex-col gap-2.5 p-6 rounded-2xl border-2 text-left',
                    'transition-[border-color,background-color,box-shadow] duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest',
                    selected ? CARD_STATE.selected : CARD_STATE.idle,
                  )}
                >
                  <span lang="ja" aria-hidden="true" className="font-jp font-bold text-4xl leading-none text-primary">
                    {opt.glyph}
                  </span>
                  <span className="font-headline text-lg font-extrabold tracking-tight text-on-surface">
                    {opt.title}
                  </span>
                  <span className="font-body text-base leading-normal text-on-surface-variant">{opt.sub}</span>
                </button>
              )
            })}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="rounded-3xl bg-surface-container-low p-6 md:p-8">
            {/* Persistent live region: announces the new plan when a level is picked. */}
            <span className="sr-only" aria-live="polite">{`${COPY.panelEyebrow}: ${plan.heading}`}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={level}
                variants={reducedMotion ? undefined : swapVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col lg:flex-row gap-8 items-start"
              >
                <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-2.5">
                  <span className="font-label text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                    {COPY.panelEyebrow}
                  </span>
                  <p className="font-headline text-2xl font-extrabold tracking-tight leading-tight text-on-surface">
                    <JaText text={plan.heading} />
                  </p>
                  <p className="font-body text-base leading-relaxed text-on-surface-variant">
                    <JaText text={plan.note} />
                  </p>
                  <Button
                    type="button"
                    onClick={startLearning}
                    {...prefetch}
                    className="self-start mt-2 min-h-12 text-base font-headline"
                  >
                    {plan.cta}
                  </Button>
                </div>

                <ol className="w-full lg:flex-[2] min-w-0 flex flex-col gap-3">
                  {plan.days.map(day => (
                    <li
                      key={day.when}
                      className="flex gap-4 items-start rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-5 py-4"
                    >
                      <span className="shrink-0 w-20 pt-0.5 font-label text-sm font-extrabold text-primary">
                        {day.when}
                      </span>
                      <span className="min-w-0 font-body text-base leading-normal text-on-surface">
                        <JaText text={day.what} />
                      </span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
