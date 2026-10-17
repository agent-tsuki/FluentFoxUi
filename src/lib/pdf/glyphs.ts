/**
 * Kana glyphs for the PDFs: compose single kana and compounds (きゃ) from the
 * KanjiVG stroke data, then draw them into boxes on a jsPDF page.
 */
import type { jsPDF } from 'jspdf'
import { applyStrokeStyle, drawStrokePath, parseStrokePath, type StrokePath, type StrokeStyle, type Vec } from '@/lib/pdf/strokes'

export interface RawStrokeEntry {
  strokes: string[]
  numbers: number[][]
}
export type RawStrokeData = Record<string, RawStrokeEntry>

/** One KanjiVG cell is 109×109 units. */
export const CELL = 109

/**
 * Same composition as src/components/kana/useKanaStrokes.ts: the small kana's
 * full cell is scaled to 0.75 and tucked to the lower right, inside a 158-wide box.
 */
const SMALL_SCALE = 0.75
const SMALL_DX = 86
const SMALL_DY = CELL - CELL * SMALL_SCALE
const COMPOUND_WIDTH = 158

export interface GlyphStroke {
  /** Absolute path in glyph-box units (composition transform already applied). */
  path: StrokePath
  /** Stroke-number label position (text baseline-left), glyph-box units. */
  number?: Vec
  /** Scale of the part this stroke belongs to (1, or 0.75 for small kana). */
  partScale: number
}

export interface PdfGlyph {
  /** Glyph box width in KanjiVG units; height is always CELL. */
  width: number
  strokes: GlyphStroke[]
}

function transformPath(p: StrokePath, s: number, dx: number, dy: number): StrokePath {
  const t = (v: Vec): Vec => [dx + v[0] * s, dy + v[1] * s]
  return { start: t(p.start), segments: p.segments.map((g) => ({ c1: t(g.c1), c2: t(g.c2), end: t(g.end) })) }
}

const glyphCache = new WeakMap<RawStrokeData, Map<string, PdfGlyph | null>>()

/** Builds a glyph for one kana or a two-character compound; null if any part has no stroke data. */
export function buildGlyph(data: RawStrokeData, character: string): PdfGlyph | null {
  let cache = glyphCache.get(data)
  if (!cache) {
    cache = new Map()
    glyphCache.set(data, cache)
  }
  const hit = cache.get(character)
  if (hit !== undefined) return hit

  const chars = Array.from(character)
  let glyph: PdfGlyph | null = null
  if (chars.length === 1 || chars.length === 2) {
    const parts: [string, number, number, number][] =
      chars.length === 2 ? [[chars[0], 1, 0, 0], [chars[1], SMALL_SCALE, SMALL_DX, SMALL_DY]] : [[chars[0], 1, 0, 0]]
    const strokes: GlyphStroke[] = []
    let ok = true
    for (const [ch, s, dx, dy] of parts) {
      const entry = data[ch]
      if (!entry) {
        ok = false
        break
      }
      entry.strokes.forEach((d, i) => {
        const n = entry.numbers[i]
        strokes.push({
          path: transformPath(parseStrokePath(d), s, dx, dy),
          number: n && n.length === 2 ? [dx + n[0] * s, dy + n[1] * s] : undefined,
          partScale: s,
        })
      })
    }
    if (ok) glyph = { width: chars.length === 2 ? COMPOUND_WIDTH : CELL, strokes }
  }
  cache.set(character, glyph)
  return glyph
}

export function hasGlyph(data: RawStrokeData, character: string): boolean {
  return buildGlyph(data, character) !== null
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface GlyphDrawOptions extends StrokeStyle {
  /** Fraction of the box the glyph may fill (default 0.9). */
  fill?: number
  /** Draw stroke-order numbers in this grey level (0–255). */
  numbers?: { color: number; fontSize: number }
}

/** mm per KanjiVG unit for a glyph fitted into a box. */
export function glyphScale(glyph: PdfGlyph, box: Box, fill = 0.9): number {
  return Math.min((box.w * fill) / glyph.width, (box.h * fill) / CELL)
}

/** Draws a glyph centred in `box`. `lineWidth` is in mm at the glyph's own scale. */
export function drawGlyph(doc: jsPDF, glyph: PdfGlyph, box: Box, opts: GlyphDrawOptions): void {
  const scale = glyphScale(glyph, box, opts.fill)
  const x = box.x + (box.w - glyph.width * scale) / 2
  const y = box.y + (box.h - CELL * scale) / 2
  applyStrokeStyle(doc, opts)
  let currentWidth = opts.lineWidth
  for (const s of glyph.strokes) {
    const lw = opts.lineWidth * (s.partScale === 1 ? 1 : 0.85)
    if (lw !== currentWidth) {
      doc.setLineWidth(lw)
      currentWidth = lw
    }
    drawStrokePath(doc, s.path, { x, y, scale })
  }
  const numbers = opts.numbers
  if (numbers) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(numbers.color)
    glyph.strokes.forEach((s, i) => {
      if (!s.number) return
      // Small kana (ゃゅょ) are cramped: shrink their labels with the glyph.
      doc.setFontSize(numbers.fontSize * (s.partScale === 1 ? 1 : 0.85))
      doc.text(String(i + 1), x + s.number[0] * scale, y + s.number[1] * scale)
    })
    doc.setTextColor(0)
  }
}

/** Draws several glyphs side by side (a kana word) starting at x; returns the end x. */
export function drawGlyphRun(
  doc: jsPDF,
  glyphs: PdfGlyph[],
  x: number,
  y: number,
  height: number,
  style: StrokeStyle,
): number {
  const scale = height / CELL
  let cx = x
  for (const g of glyphs) {
    drawGlyph(doc, g, { x: cx, y, w: g.width * scale, h: height }, { ...style, fill: 1 })
    cx += g.width * scale * 0.92 // KanjiVG cells have side bearings; tighten slightly
  }
  return cx
}

/** Printable in jsPDF's built-in Helvetica (WinAnsi ≈ Latin-1). */
export function isLatin1Printable(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0
  return (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff)
}

type Run = { kind: 'text'; text: string } | { kind: 'kana'; glyph: PdfGlyph }

/**
 * Splits text into Latin-1 text runs and drawable kana. Returns null if a
 * character is neither (e.g. kanji, emoji) — callers decide the fallback.
 * With `dropUndrawable`, such characters are skipped instead.
 */
export function toRuns(data: RawStrokeData, text: string, dropUndrawable = false): Run[] | null {
  const runs: Run[] = []
  for (const ch of Array.from(text)) {
    if (isLatin1Printable(ch)) {
      const last = runs[runs.length - 1]
      if (last && last.kind === 'text') last.text += ch
      else runs.push({ kind: 'text', text: ch })
      continue
    }
    const glyph = buildGlyph(data, ch)
    if (glyph) runs.push({ kind: 'kana', glyph })
    else if (!dropUndrawable) return null
  }
  return runs
}

const PT_TO_MM = 25.4 / 72

/** Kana drawn next to Helvetica text: glyph cell ≈ 1.2× the font's cap height region. */
function kanaHeightFor(fontSizePt: number): number {
  return fontSizePt * PT_TO_MM * 1.15
}

export function measureRuns(doc: jsPDF, runs: Run[], fontSizePt: number): number {
  doc.setFontSize(fontSizePt)
  const kh = kanaHeightFor(fontSizePt)
  return runs.reduce(
    (w, r) => w + (r.kind === 'text' ? doc.getTextWidth(r.text) : (r.glyph.width / CELL) * kh * 0.92),
    0,
  )
}

/**
 * Draws mixed Latin text + kana on a text baseline. Font face/colour must be
 * set by the caller; kana strokes use `kanaStyle`. Returns the end x.
 */
export function drawRuns(
  doc: jsPDF,
  runs: Run[],
  x: number,
  baseline: number,
  fontSizePt: number,
  kanaStyle: StrokeStyle,
): number {
  doc.setFontSize(fontSizePt)
  const kh = kanaHeightFor(fontSizePt)
  // KanjiVG glyphs sit roughly in the middle 80% of their cell; align the cell
  // so its lower edge is a little below the baseline, like a descender.
  const top = baseline - kh * 0.82
  let cx = x
  for (const r of runs) {
    if (r.kind === 'text') {
      doc.text(r.text, cx, baseline)
      cx += doc.getTextWidth(r.text)
    } else {
      cx = drawGlyphRun(doc, [r.glyph], cx, top, kh, kanaStyle)
    }
  }
  return cx
}
