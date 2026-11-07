import { useCallback, useEffect, useMemo, useState } from 'react'
import { pathToPoints, type GlyphTransform, type Point } from '@/components/kana/strokeGeometry'
import type { RawStrokeData } from '@/lib/pdf/glyphs'
import { useKanaScript } from '@/context/KanaScriptContext'

export interface GlyphStroke {
  d: string
  /** SVG transform for the stroke's glyph (identity for single kana). */
  transform: string
  /** Reference polyline in drawing-box coordinates, for tracing. */
  points: Point[]
  /** Stroke-number label position in the stroke's own (untransformed) frame. */
  number?: Point
}

export interface KanaGlyph {
  /** Drawing box width; height is always 109 (one KanjiVG cell). */
  width: number
  strokes: GlyphStroke[]
}

export const CELL = 109

/**
 * Compound kana (きゃ): the small ゃ cell is shrunk and tucked to the lower right.
 * KanjiVG's small kana already sit low in a full-size cell, so 0.75 of the cell
 * makes the glyph about 60% the height of the base kana.
 */
const SMALL_KANA: GlyphTransform = { scale: 0.75, dx: 86, dy: CELL - CELL * 0.75 }
// Small glyphs end ~86 units into their cell; leave a little margin past that.
const COMPOUND_WIDTH = 158

function toTransform(t: GlyphTransform): string {
  return t.scale === 1 ? '' : `translate(${t.dx} ${t.dy}) scale(${t.scale})`
}

function buildGlyph(data: RawStrokeData, character: string): KanaGlyph | null {
  const chars = Array.from(character)
  const parts: [string, GlyphTransform][] = chars.length === 2
    ? [[chars[0], { scale: 1, dx: 0, dy: 0 }], [chars[1], SMALL_KANA]]
    : [[chars[0], { scale: 1, dx: 0, dy: 0 }]]

  const strokes: GlyphStroke[] = []
  for (const [ch, t] of parts) {
    const entry = data[ch]
    if (!entry) return null
    entry.strokes.forEach((d, i) => {
      const n = entry.numbers[i]
      strokes.push({
        d,
        transform: toTransform(t),
        points: pathToPoints(d, t),
        number: n && n.length === 2 ? [n[0], n[1]] : undefined,
      })
    })
  }
  return { width: chars.length === 2 ? COMPOUND_WIDTH : CELL, strokes }
}

type StrokeState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | { status: 'ready'; glyph: KanaGlyph }

/** Stroke data already loaded this session, per script loader. */
const loadedData = new WeakMap<() => Promise<RawStrokeData>, RawStrokeData>()

/**
 * Stroke data for one kana (or a compound like きゃ), loaded lazily from the
 * current script's KanjiVG-derived JSON (`script.loadStrokes`, cached per
 * session) so it stays out of the chart's initial bundle. Once the data is in,
 * every other kana is ready on its first render (no loading flash when
 * stepping through the chart).
 */
export function useKanaStrokes(character: string): StrokeState & { retry: () => void } {
  const { loadStrokes } = useKanaScript()
  const [data, setData] = useState<RawStrokeData | undefined>(() => loadedData.get(loadStrokes))
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const cached = loadedData.get(loadStrokes)
    if (cached) {
      setData(cached)
      return
    }
    let cancelled = false
    setFailed(false)
    loadStrokes()
      .then((loaded) => {
        loadedData.set(loadStrokes, loaded)
        if (!cancelled) setData(loaded)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [attempt, loadStrokes])

  const state = useMemo<StrokeState>(() => {
    if (data) {
      const glyph = buildGlyph(data, character)
      return glyph ? { status: 'ready', glyph } : { status: 'missing' }
    }
    return failed ? { status: 'error' } : { status: 'loading' }
  }, [data, failed, character])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { ...state, retry }
}
