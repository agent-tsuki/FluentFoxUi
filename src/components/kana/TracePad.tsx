import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useKanaProgressStore } from '@/hooks/useKanaProgress'
import { cn } from '@/lib/cn'
import { CellGuides } from '@/components/kana/StrokeOrder'
import { CELL, type KanaGlyph } from '@/components/kana/useKanaStrokes'
import { judgeStroke, pointsToPath, polylineLength, type Point } from '@/components/kana/strokeGeometry'

interface TracePadProps {
  id: string
  glyph: KanaGlyph
}

interface Miss {
  key: number
  d: string
  hint: string
}

/**
 * TracePad — the learner draws each stroke in order over a faint guide
 * (Pointer Events: finger, mouse or pen). Each stroke is checked on release;
 * a match turns green and locks, a miss shakes, fades, and shows a hint.
 * The live stroke is drawn through a ref (no per-move React state).
 * Optional for keyboard/screen-reader users: the status line is the text
 * alternative and nothing else on the sheet depends on it.
 */
export function TracePad({ id, glyph }: TracePadProps) {
  const reducedMotion = useReducedMotion()
  const progress = useKanaProgressStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const liveRef = useRef<SVGPathElement>(null)
  const points = useRef<Point[]>([])
  const drawing = useRef(false)
  const [done, setDone] = useState(0)
  const [miss, setMiss] = useState<Miss | null>(null)

  const total = glyph.strokes.length
  const complete = done >= total

  useEffect(() => {
    if (complete) progress.markTraced(id)
  }, [complete, id, progress])

  /** Screen → viewBox coordinates, so every check runs in the 109-unit cell space. */
  const toLocal = (clientX: number, clientY: number): Point | null => {
    const ctm = svgRef.current?.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return [p.x, p.y]
  }

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (complete || e.button !== 0) return
    const p = toLocal(e.clientX, e.clientY)
    if (!p) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* pointer already gone (or synthetic): keep drawing without capture */
    }
    drawing.current = true
    points.current = [p]
    liveRef.current?.setAttribute('d', pointsToPath(points.current))
  }

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drawing.current) return
    // Coalesced events give smoother curves; the list can be empty (Safari,
    // synthetic events), so fall back to the event itself.
    const coalesced = e.nativeEvent.getCoalescedEvents?.() ?? []
    const events = coalesced.length > 0 ? coalesced : [e.nativeEvent]
    for (const ev of events) {
      const p = toLocal(ev.clientX, ev.clientY)
      if (p) points.current.push(p)
    }
    liveRef.current?.setAttribute('d', pointsToPath(points.current))
  }

  const endStroke = (cancelled: boolean) => {
    if (!drawing.current) return
    drawing.current = false
    const drawn = points.current
    points.current = []
    liveRef.current?.setAttribute('d', '')
    const ref = glyph.strokes[done]
    // Ignore accidental taps, except on tiny strokes like dakuten dots.
    if (cancelled || !ref || (polylineLength(drawn) < 3 && polylineLength(ref.points) > 12)) return

    const verdict = judgeStroke(drawn, ref.points, glyph.strokes.slice(done + 1).map((s) => s.points))
    if (verdict.ok) {
      setMiss(null)
      setDone((n) => n + 1)
      navigator.vibrate?.(12)
    } else {
      setMiss({ key: Date.now(), d: pointsToPath(drawn), hint: verdict.hint })
    }
  }

  const reset = () => {
    setDone(0)
    setMiss(null)
  }

  const next = glyph.strokes[done]

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        aria-hidden
        data-trace-pad
        viewBox={`0 0 ${glyph.width} ${CELL}`}
        className={cn(
          'w-full touch-none select-none rounded-2xl border bg-surface-container-low',
          glyph.width > CELL ? 'max-w-[22rem]' : 'max-w-[18rem]',
          complete ? 'border-success/60' : 'border-outline-variant/50',
          !complete && 'cursor-crosshair',
        )}
        style={{ aspectRatio: `${glyph.width} / ${CELL}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => endStroke(false)}
        onPointerCancel={() => endStroke(true)}
      >
        <CellGuides width={glyph.width} />
        {glyph.strokes.map((s, i) => (
          <path
            key={i}
            d={s.d}
            transform={s.transform || undefined}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={i < done ? 5 : 6}
            className={cn(
              'transition-colors duration-300',
              i < done ? 'stroke-success' : i === done ? 'stroke-primary/25' : 'stroke-outline-variant/60',
            )}
          />
        ))}
        {/* Where the next stroke starts. */}
        {next && <circle cx={next.points[0][0]} cy={next.points[0][1]} r={3.5} className="fill-primary" />}

        <AnimatePresence>
          {miss && (
            <motion.path
              key={miss.key}
              d={miss.d}
              fill="none"
              strokeWidth={4}
              strokeLinecap="round"
              className="stroke-warning"
              initial={{ opacity: 1, x: 0 }}
              animate={reducedMotion ? { opacity: 0 } : { opacity: [1, 1, 0], x: [0, -3, 3, -2, 2, 0] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
        <path ref={liveRef} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
      </svg>

      <TraceStatus done={done} total={total} hint={miss?.hint} onReset={reset} />
    </div>
  )
}

interface TraceStatusProps {
  done: number
  total: number
  hint?: string
  onReset: () => void
}

/** Visible, announced progress line: the text alternative to the pad. */
function TraceStatus({ done, total, hint, onReset }: TraceStatusProps) {
  const complete = done >= total
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <p aria-live="polite" className="text-sm text-on-surface-variant">
        {complete ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-success">
            <Icon name="check_circle" filled className="text-xl" />
            All {total} strokes traced. Nice!
          </span>
        ) : (
          <>
            Draw each stroke in order; stroke {done + 1} of {total}
            {hint && <span className="block font-semibold text-warning">{hint}</span>}
          </>
        )}
      </p>
      {(complete || done > 0) && (
        <button
          type="button"
          onClick={onReset}
          className="-mr-3 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name="refresh" className="text-xl" />
          {complete ? 'Trace again' : 'Start over'}
        </button>
      )}
    </div>
  )
}
