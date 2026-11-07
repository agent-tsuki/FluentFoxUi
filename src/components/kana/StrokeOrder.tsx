import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TextButton } from '@/components/ui/TextLink'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { easings } from '@/lib/motion'
import { CELL, type KanaGlyph } from '@/components/kana/useKanaStrokes'

interface StrokeOrderProps {
  glyph: KanaGlyph
  /** Character spoken by screen readers, e.g. "あ". */
  character: string
  /** Size of the drawing (defaults to a 15rem-wide card). */
  className?: string
  /** Slow drawing (the default, easier to follow). Controlled when `onSlowChange` is given (the setting then survives prev/next). */
  slow?: boolean
  onSlowChange?: (slow: boolean) => void
}

/** Seconds per stroke and the pause before the next, at normal and slow speed. */
const TIMING = {
  normal: { draw: 0.6, gap: 0.2 },
  slow: { draw: 1.2, gap: 0.45 },
} as const
/** How long the stroke being drawn stays in the accent colour after it finishes. */
const HIGHLIGHT_FADE = 0.35

/**
 * StrokeOrder — draws each stroke in order (framer-motion `pathLength`, i.e.
 * stroke-dasharray/dashoffset) over a faint finished shape, with its number at
 * the stroke start. The stroke being drawn is in the accent colour and settles
 * into the ink colour, and a counter follows along ("Stroke 2 of 3"). Plays
 * once per mount (so a new character replays it), slowly by default; the
 * speed link switches between slow and normal and Replay restarts it (both
 * text links). Reduced motion shows the finished character.
 */
export function StrokeOrder({ glyph, character, className, slow: slowProp, onSlowChange }: StrokeOrderProps) {
  const reducedMotion = useReducedMotion()
  const [run, setRun] = useState(0)
  const [slowState, setSlowState] = useState(true)
  const slow = onSlowChange ? (slowProp ?? true) : slowState
  const setSlow = (next: boolean) => (onSlowChange ? onSlowChange(next) : setSlowState(next))
  const animate = !reducedMotion
  const { draw, gap } = TIMING[slow ? 'slow' : 'normal']
  const total = glyph.strokes.length

  // Which stroke is being drawn (1-based); total + 1 once finished.
  const [current, setCurrent] = useState(animate ? 1 : total + 1)
  useEffect(() => {
    if (!animate) {
      setCurrent(total + 1)
      return
    }
    setCurrent(1)
    const timers = glyph.strokes.map((_, i) => window.setTimeout(() => setCurrent(i + 2), ((i + 1) * (draw + gap) - gap) * 1000))
    return () => timers.forEach(window.clearTimeout)
  }, [animate, run, draw, gap, total, glyph])

  const restart = () => setRun((r) => r + 1)
  const done = current > total

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <svg
        // A new key remounts the strokes, so changing speed or Replay draws from the start.
        key={`${run}-${slow}`}
        role="img"
        aria-label={`Stroke order for ${character}: ${total} strokes`}
        viewBox={`0 0 ${glyph.width} ${CELL}`}
        className={cn(
          'w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low',
          className ?? 'max-w-[15rem]',
        )}
        style={{ aspectRatio: `${glyph.width} / ${CELL}` }}
      >
        <CellGuides width={glyph.width} />
        {/* Faint finished shape underneath, so the learner sees where it's heading. */}
        {glyph.strokes.map((s, i) => (
          <path key={`ghost-${i}`} d={s.d} transform={s.transform || undefined} className="stroke-outline-variant/60" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
        {glyph.strokes.map((s, i) => {
          const delay = i * (draw + gap)
          const line = { pathLength: { delay, duration: draw, ease: easings.out }, opacity: { delay, duration: 0.01 } }
          return (
            <g key={i} transform={s.transform || undefined}>
              <motion.path
                d={s.d}
                className="stroke-on-surface"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                // Hidden until its turn: round caps would show a dot at pathLength 0.
                initial={animate ? { pathLength: 0, opacity: 0 } : false}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={line}
              />
              {animate && (
                // The same stroke in the accent colour on top while it is drawn, then fading out.
                <motion.path
                  d={s.d}
                  className="stroke-primary"
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{
                    pathLength: { delay, duration: draw, ease: easings.out },
                    opacity: { delay, duration: draw + HIGHLIGHT_FADE, times: [0, 0.01, draw / (draw + HIGHLIGHT_FADE), 1] },
                  }}
                />
              )}
              {s.number && (
                <motion.text
                  x={s.number[0]}
                  y={s.number[1]}
                  className="fill-primary font-body font-bold"
                  fontSize={8}
                  initial={animate ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay, duration: 0.2 }}
                >
                  {i + 1}
                </motion.text>
              )}
            </g>
          )
        })}
      </svg>

      <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1">
        {/* Visual only; the drawing's label already gives the stroke count. */}
        <p aria-hidden className="text-sm font-semibold tabular-nums text-on-surface-variant">
          {done ? `${total} ${total === 1 ? 'stroke' : 'strokes'}` : `Stroke ${current} of ${total}`}
        </p>
        {animate && (
          <div className="flex items-center gap-4">
            {/* Says what it switches to; the drawing restarts at the new speed. */}
            <TextButton onClick={() => setSlow(!slow)} tone="neutral" leadingIcon={slow ? 'fast_forward' : 'timer'}>
              {slow ? 'Normal speed' : 'Slow speed'}
            </TextButton>
            <TextButton onClick={restart} leadingIcon="replay">
              Replay
            </TextButton>
          </div>
        )}
      </div>
      <p className="w-full text-right text-xs text-on-surface-variant">
        Stroke data:{' '}
        <a
          href="https://kanjivg.tagaini.net"
          target="_blank"
          rel="noopener noreferrer"
          className="-my-2 inline-block py-2 underline decoration-outline underline-offset-2 hover:text-on-surface"
        >
          KanjiVG
        </a>
        , CC BY-SA 3.0
      </p>
    </div>
  )
}

/** Dashed centre lines for each cell, like squared writing paper. */
export function CellGuides({ width }: { width: number }) {
  const mid = CELL / 2
  return (
    <g aria-hidden className="stroke-outline-variant/70" strokeWidth={0.5} strokeDasharray="2 2" fill="none">
      <line x1={0} y1={mid} x2={width} y2={mid} />
      <line x1={mid} y1={0} x2={mid} y2={CELL} />
    </g>
  )
}
