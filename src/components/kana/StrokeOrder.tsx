import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { easings } from '@/lib/motion'
import { CELL, type KanaGlyph } from '@/components/kana/useKanaStrokes'

interface StrokeOrderProps {
  glyph: KanaGlyph
  /** Character spoken by screen readers, e.g. "あ". */
  character: string
}

/** Seconds per stroke, and the pause before the next one starts. */
const DRAW = 0.6
const GAP = 0.2

/**
 * StrokeOrder — draws each stroke in order (framer-motion `pathLength`, i.e.
 * stroke-dasharray/dashoffset) with its number at the stroke start. Plays once
 * per mount; Replay restarts it. Reduced motion shows the finished character.
 */
export function StrokeOrder({ glyph, character }: StrokeOrderProps) {
  const reducedMotion = useReducedMotion()
  const [run, setRun] = useState(0)
  const animate = !reducedMotion

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        key={run}
        role="img"
        aria-label={`Stroke order for ${character}: ${glyph.strokes.length} strokes`}
        viewBox={`0 0 ${glyph.width} ${CELL}`}
        className="w-full max-w-[15rem] rounded-2xl border border-outline-variant/50 bg-surface-container-low"
        style={{ aspectRatio: `${glyph.width} / ${CELL}` }}
      >
        <CellGuides width={glyph.width} />
        {/* Faint finished shape underneath, so the learner sees where it's heading. */}
        {glyph.strokes.map((s, i) => (
          <path key={`ghost-${i}`} d={s.d} transform={s.transform || undefined} className="stroke-outline-variant" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
        {glyph.strokes.map((s, i) => {
          const delay = i * (DRAW + GAP)
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
                transition={{ pathLength: { delay, duration: DRAW, ease: easings.out }, opacity: { delay, duration: 0.01 } }}
              />
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

      <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {animate && (
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="-ml-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name="refresh" className="text-xl" />
          Replay
        </button>
        )}
        <p className="ml-auto text-xs text-on-surface-variant">
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
