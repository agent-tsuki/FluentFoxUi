import type { KanjiStrokeData } from '@/types/kanji'
import { CELL, type KanaGlyph } from '@/components/kana/useKanaStrokes'
import { pathToPoints } from '@/components/kana/strokeGeometry'

const cache = new WeakMap<KanjiStrokeData, KanaGlyph>()

/**
 * KanjiVG stroke data → the glyph shape StrokeOrder and TracePad draw (one
 * 109-unit cell, identity transform), so kanji reuse the kana stroke widgets.
 */
export function kanjiGlyph(data: KanjiStrokeData): KanaGlyph {
  const hit = cache.get(data)
  if (hit) return hit
  const glyph: KanaGlyph = {
    width: CELL,
    strokes: data.strokes.map((d, i) => ({
      d,
      transform: '',
      points: pathToPoints(d),
      number: data.numbers[i],
    })),
  }
  cache.set(data, glyph)
  return glyph
}
