import { useCallback, useState } from 'react'
import { FadeIn } from '@/components/ui/FadeIn'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useStartLearning } from '@/hooks/useStartLearning'
import { PATH_COPY, PATH_STOPS, type PathStop } from '@/lib/content/home/path'
import { PathTrack } from './PathTrack'
import { PathBoard } from './PathBoard'
import { JaText } from './JaText'

/**
 * "The path" — a dark band (in both themes) showing the Kana → N5 → N4 → N3 line.
 * Selecting a station moves the train, updates the board card and the details.
 */
export function LearningPath() {
  const [current, setCurrent] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const lastIndex = PATH_STOPS.length - 1

  const select = useCallback((index: number) => {
    setCurrent(index)
    setRevealed(false)
  }, [])
  const goPrev = useCallback(() => {
    setCurrent((i) => Math.max(i - 1, 0))
    setRevealed(false)
  }, [])
  const goNext = useCallback(() => {
    setCurrent((i) => Math.min(i + 1, lastIndex))
    setRevealed(false)
  }, [lastIndex])
  const reveal = useCallback(() => setRevealed(true), [])

  return (
    <section
      id="path"
      className="scroll-mt-nav overflow-hidden bg-surface-inverse text-on-surface-inverse"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 md:px-10 md:py-24">
        <FadeIn className="flex max-w-3xl flex-col gap-3.5">
          <Eyebrow className="!mb-0 !text-primary-fixed-dim">{PATH_COPY.eyebrow}</Eyebrow>
          <h2 className="font-headline text-display-md font-extrabold tracking-tight text-on-surface-inverse">
            {PATH_COPY.title}
          </h2>
          <p className="text-lg leading-relaxed text-on-surface-inverse-variant">
            {PATH_COPY.description}
          </p>
        </FadeIn>

        <PathTrack stops={PATH_STOPS} current={current} onSelect={select} />

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <PathBoard
            stops={PATH_STOPS}
            current={current}
            revealed={revealed}
            onReveal={reveal}
            onPrev={goPrev}
            onNext={goNext}
          />
          <StopDetails stop={PATH_STOPS[current]} />
        </div>
      </div>
    </section>
  )
}

function StopDetails({ stop }: { stop: PathStop }) {
  const { startLearning, prefetch } = useStartLearning()
  const locked = Boolean(stop.locked)

  return (
    <div className="flex flex-col gap-4 px-1 py-2">
      <Eyebrow className="!mb-0 !text-primary-fixed-dim">{stop.stage}</Eyebrow>
      <h3 className="font-headline text-2xl font-extrabold leading-tight tracking-tight text-on-surface-inverse md:text-3xl">
        {stop.title}
      </h3>
      <p className="text-base font-bold text-on-surface-inverse-variant">
        {locked ? PATH_COPY.canLabelLocked : PATH_COPY.canLabelOpen}
      </p>
      <ul className="flex flex-col gap-2.5">
        {stop.can.map((item) => (
          <li key={item} className="flex items-start gap-3 text-base leading-normal text-on-surface-inverse md:text-lg">
            <Icon name="check" className="mt-0.5 shrink-0 text-xl text-success" />
            <span>
              <JaText text={item} />
            </span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-2" aria-label={`${stop.title} includes`}>
        {stop.chips.map((chip) => (
          <li
            key={chip}
            className="rounded-full border border-on-surface-inverse/15 bg-on-surface-inverse/5 px-3 py-1.5 text-sm font-bold text-on-surface-inverse"
          >
            {chip}
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 text-base text-on-surface-inverse-variant">
        <Icon name="schedule" className="shrink-0 text-lg text-primary-fixed-dim" />
        {stop.time}
      </p>
      {locked ? (
        // TODO: no waitlist endpoint exists yet — for now this opens the same signup flow.
        <Button
          type="button"
          variant="white"
          onClick={startLearning}
          {...prefetch}
          className="mt-1.5 min-h-11 self-start py-3.5 font-extrabold !text-on-primary-fixed-variant"
        >
          {PATH_COPY.notifyCta}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={startLearning}
          {...prefetch}
          className="mt-1.5 min-h-11 self-start py-3.5"
        >
          {stop.cta}
        </Button>
      )}
    </div>
  )
}
