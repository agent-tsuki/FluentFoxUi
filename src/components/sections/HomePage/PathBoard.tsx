import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { durations, easings } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PATH_COPY, type PathStop } from '@/lib/content/home/path'

interface PathBoardProps {
  stops: readonly PathStop[]
  current: number
  revealed: boolean
  onReveal: () => void
  onPrev: () => void
  onNext: () => void
}

/**
 * The "station board" card: a Japanese sample from the selected stop with a
 * "Show meaning" reveal, and previous/next stop controls along the bottom.
 */
export function PathBoard({ stops, current, revealed, onReveal, onPrev, onNext }: PathBoardProps) {
  const reducedMotion = useReducedMotion()
  const stop = stops[current]
  const locked = Boolean(stop.locked)
  const prev = current > 0 ? stops[current - 1] : null
  const next = current < stops.length - 1 ? stops[current + 1] : null

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface-raised text-ink shadow-elevation-3 dark:ring-1 dark:ring-on-surface-inverse/10">
      <div className="flex min-h-56 flex-1 flex-col gap-3.5 px-5 pb-6 pt-7 sm:px-7">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-muted">
          {locked ? PATH_COPY.promptLocked : PATH_COPY.promptOpen}
        </span>
        <p
          lang="ja"
          aria-hidden={locked || undefined}
          className={cn(
            'font-ja-display m-0 text-[clamp(1.625rem,3.2vw,2.5rem)] font-bold leading-snug text-ink',
            locked && 'select-none blur-[6px]'
          )}
        >
          {stop.sample}
        </p>

        {locked ? (
          <span className="text-base font-semibold text-ink-muted">{PATH_COPY.lockedNote}</span>
        ) : revealed ? (
          <motion.div
            role="status"
            className="flex flex-col gap-1.5"
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.resize, ease: easings.out }}
          >
            <span className="text-base italic text-ink-muted md:text-lg">{stop.reading}</span>
            <span className="text-base font-bold leading-normal md:text-lg">{stop.meaning}</span>
          </motion.div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onReveal}
            className="min-h-11 self-start font-display"
          >
            {PATH_COPY.revealLabel}
          </Button>
        )}
      </div>

      <div aria-hidden="true" className="h-1.5 bg-primary" />

      <div className="flex justify-between gap-2 bg-surface-inverse p-1.5">
        <BoardButton direction="prev" target={prev} onClick={onPrev} />
        <BoardButton direction="next" target={next} onClick={onNext} />
      </div>
    </div>
  )
}

interface BoardButtonProps {
  direction: 'prev' | 'next'
  target: PathStop | null
  onClick: () => void
}

function BoardButton({ direction, target, onClick }: BoardButtonProps) {
  const isPrev = direction === 'prev'
  const label = target ? (
    <span lang="ja" className="font-ja-display">
      {target.ja}
    </span>
  ) : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!target}
      className={cn(
        'min-h-12 flex-1 rounded-md px-3.5 font-display text-[0.9375rem] font-bold leading-tight transition-colors duration-200',
        'text-on-surface-inverse hover:bg-on-surface-inverse/10 disabled:cursor-default disabled:text-on-surface-inverse-variant/70 disabled:hover:bg-transparent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim',
        isPrev ? 'text-left' : 'text-right'
      )}
    >
      <span className="sr-only">{isPrev ? PATH_COPY.prevSrLabel : PATH_COPY.nextSrLabel} </span>
      {isPrev && <Icon name="arrow_back" className="mr-1 align-[-0.2em] text-[1.125em]" />}
      {target ? (
        <>
          {label} · {target.en}
        </>
      ) : isPrev ? (
        PATH_COPY.startOfLine
      ) : (
        PATH_COPY.endOfLine
      )}
      {!isPrev && <Icon name="arrow_forward" className="ml-1 align-[-0.2em] text-[1.125em]" />}
    </button>
  )
}
