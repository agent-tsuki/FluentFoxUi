/**
 * Full kana chart posters (per script), one page each:
 *  - 'colour-a3'    — wall poster, every row on its own soft colour band.
 *  - 'print-a4'     — ink-saving black/grey version of the same chart.
 *  - 'colour-in-a3' — same layout with hollow kana and blank bands to colour
 *                     in as rows are learned.
 *
 * Layout is written in A3 millimetres and scaled by `k` for A4, so all three
 * share one geometry. Kana are KanjiVG strokes (see glyphs.ts); Helvetica is
 * used only for Latin text. Kana missing from the list or the stroke data
 * degrade to romaji only.
 */
import type { jsPDF } from 'jspdf'
import type { KanaChar } from '@/types'
import type { KanaGroupId } from '@/lib/content/kana/courseTypes'
import { unitsOfGroup, type KanaScriptConfig } from '@/lib/content/kana/scripts'
import { buildGlyph, CELL, drawGlyph, drawGlyphRun, glyphScale, type Box, type PdfGlyph, type RawStrokeData } from '@/lib/pdf/glyphs'
import { CREDIT_LINE } from '@/lib/pdf/shared'
import type { PosterVariant } from '@/lib/pdf'
import { drawFox, type Rgb } from '@/lib/pdf/posterFox'

type JsPdfCtor = typeof jsPDF

// ─── Palette (print art, not themed UI — see certificate.ts) ─────────────────

const BRAND: Rgb = [187, 77, 44] // #BB4D2C, the `primary` token
const BRAND_SOFT: Rgb = [255, 226, 212]
const INK: Rgb = [45, 34, 30]
const MUTED: Rgb = [112, 98, 92]
const WHITE: Rgb = [255, 255, 255]
const OUTLINE_INK: Rgb = [60, 60, 60]
const PRINT_LINE: Rgb = [165, 165, 165]
const PRINT_MUTED: Rgb = [95, 95, 95]

/** Soft band + readable accent, one per gojūon row (warm → cool, all light enough to print). */
interface RowColour {
  band: Rgb
  accent: Rgb
}
const ROW_COLOURS: RowColour[] = [
  { band: [252, 224, 214], accent: [178, 70, 40] }, // coral (brand)
  { band: [253, 231, 204], accent: [168, 92, 18] }, // amber
  { band: [249, 239, 198], accent: [138, 104, 8] }, // honey
  { band: [233, 240, 207], accent: [96, 114, 28] }, // olive
  { band: [218, 237, 221], accent: [46, 112, 70] }, // sage
  { band: [210, 236, 232], accent: [18, 110, 104] }, // teal
  { band: [214, 231, 246], accent: [32, 96, 156] }, // sky
  { band: [224, 227, 248], accent: [70, 82, 166] }, // periwinkle
  { band: [235, 225, 246], accent: [110, 72, 158] }, // lavender
  { band: [247, 222, 234], accent: [158, 58, 108] }, // rose
  { band: [252, 228, 218], accent: [178, 70, 40] }, // ん: back to brand
]

// ─── Content ─────────────────────────────────────────────────────────────────

const GOJUON: (string | null)[][] = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', null, 'yu', null, 'yo'],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', null, null, null, 'wo'],
  ['n'],
]
const ROW_LABELS = ['A', 'KA', 'SA', 'TA', 'NA', 'HA', 'MA', 'YA', 'RA', 'WA', 'N']
const VOWELS = ['a', 'i', 'u', 'e', 'o']

/** Every kana id of one of the script's groups, in path order. */
const groupKanaIds = (script: KanaScriptConfig, group: KanaGroupId) => unitsOfGroup(script, group).flatMap((u) => u.kanaIds)

/** How each group is counted on the banner ("46 basic kana, 25 dakuten and 33 combinations"). */
const GROUP_NOUN: Record<KanaGroupId, string> = {
  basic: 'basic kana',
  dakuten: 'dakuten',
  combo: 'combinations',
  foreign: 'foreign sounds',
}

function chartSummary(script: KanaScriptConfig): string {
  const parts = script.groups.map((g) => `${groupKanaIds(script, g.id).length} ${GROUP_NOUN[g.id]}`)
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts.join('')
  return `The complete chart: ${list}.`
}
const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size))

/** Gojūon row each voiced / combination row borrows its colour from. */
const DAKUTEN_ROW_COLOUR = [1, 2, 3, 5, 5] // g z d b p
const COMBO_ROW_COLOUR = [1, 2, 3, 4, 5, 6, 8, 1, 2, 5, 5] // ky sh ch ny hy my ry gy j by py

/**
 * Katakana's foreign-sound panel, four across: the two marks first, then the
 * combos grouped by family. Ids missing here are appended; missing kana leave
 * a dashed gap.
 */
const FOREIGN_ROWS: string[][] = [
  ['long', 'sokuon', 'vu', 'ye'],
  ['fa', 'fi', 'fe', 'fo'],
  ['va', 'vi', 've', 'vo'],
  ['wi', 'we', 'who', 'fyu'],
  ['ti', 'di', 'tu', 'du'],
  ['tyu', 'dyu', 'she', 'je'],
  ['che', 'tsa', 'tse', 'tso'],
]
const FOREIGN_ROW_COLOUR = [0, 5, 7, 6, 3, 9, 2] // marks f v w t/d ty/sh ch/ts
/** Cell labels for the marks, which have no romaji. */
const MARK_LABELS: Record<string, string> = { long: 'long', sokuon: 'pause' }

// ─── Geometry (A3 mm; multiplied by k) ───────────────────────────────────────

const A3_W = 297
const M = 12
const BANNER_Y = 12
const BANNER_H = 40

const GRID_X = M
const GRID_W = 186
const LABEL_W = 22
const GRID_TOP = 70
const GRID_BOTTOM = 396
const ROW_GAP = 2
const BAND_PAD = 1.4
const CELL_GAP = 2

const SIDE_X = 206
const SIDE_W = A3_W - M - SIDE_X
const PANEL_PAD = 1.2
const PANEL_GAP = 1.2

/**
 * Scripts with foreign sounds (katakana) have 30 more kana: the gojūon grid
 * ends higher, the side column holds dakuten + foreign sounds, and the
 * combinations run full width underneath, one column per row (キャ キュ キョ).
 */
const WIDE = {
  gridBottom: 322,
  stripTop: 331,
  stripBottom: 397,
}

/** Glyph line weight as a fraction of the drawn glyph height. */
const SOLID_WEIGHT = 0.064
const PRINT_WEIGHT = 0.058
const HOLLOW_OUTER = 0.1

// ─── Drawing context ─────────────────────────────────────────────────────────

interface Ctx {
  doc: jsPDF
  data: RawStrokeData
  script: KanaScriptConfig
  variant: PosterVariant
  k: number
  byId: Map<string, KanaChar>
  /** The script has a foreign-sounds group (katakana layout, see WIDE). */
  wide: boolean
}

const isColour = (c: Ctx) => c.variant === 'colour-a3'
const isPrint = (c: Ctx) => c.variant === 'print-a4'
const isHollow = (c: Ctx) => c.variant === 'colour-in-a3'

const hex = (c: Rgb) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
const fill = (doc: jsPDF, c: Rgb) => doc.setFillColor(c[0], c[1], c[2])
const draw = (doc: jsPDF, c: Rgb) => doc.setDrawColor(c[0], c[1], c[2])
const ink = (doc: jsPDF, c: Rgb) => doc.setTextColor(c[0], c[1], c[2])

/** Font size: scaled with the page but never below `min` pt. */
const fs = (c: Ctx, pt: number, min = 5.5) => Math.max(pt * c.k, min)

function text(
  c: Ctx,
  s: string,
  x: number,
  y: number,
  pt: number,
  colour: Rgb,
  opts: { bold?: boolean; align?: 'left' | 'center' | 'right'; min?: number } = {},
): void {
  c.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
  c.doc.setFontSize(fs(c, pt, opts.min))
  ink(c.doc, colour)
  c.doc.text(s, x * c.k, y * c.k, { align: opts.align ?? 'left' })
}

function scaleBox(c: Ctx, b: Box): Box {
  return { x: b.x * c.k, y: b.y * c.k, w: b.w * c.k, h: b.h * c.k }
}

interface KanaDraw {
  /** Box in A3 units. */
  box: Box
  colour: Rgb
  fill?: number
  numbers?: { colour: Rgb; pt: number }
}

/** Draws one glyph solid or hollow (per variant), plus optional coloured stroke numbers. */
function drawKana(c: Ctx, glyph: PdfGlyph, d: KanaDraw): void {
  const box = scaleBox(c, d.box)
  const fillRatio = d.fill ?? 0.98
  const scale = glyphScale(glyph, box, fillRatio)
  const h = CELL * scale
  if (isHollow(c)) {
    const outer = h * HOLLOW_OUTER
    const inner = Math.max(outer - 0.6 * c.k * 1.4, outer * 0.45)
    drawGlyph(c.doc, glyph, box, { color: hex(OUTLINE_INK), lineWidth: outer, fill: fillRatio })
    drawGlyph(c.doc, glyph, box, { color: hex(WHITE), lineWidth: inner, fill: fillRatio })
  } else {
    drawGlyph(c.doc, glyph, box, {
      color: hex(d.colour),
      lineWidth: h * (isPrint(c) ? PRINT_WEIGHT : SOLID_WEIGHT),
      fill: fillRatio,
    })
  }
  const numbers = d.numbers
  if (numbers) {
    const x = box.x + (box.w - glyph.width * scale) / 2
    const y = box.y + (box.h - CELL * scale) / 2
    const pt = Math.max(numbers.pt * c.k, 4.6)
    const r = pt * 0.3 // bubble radius (mm) for a one-digit label
    c.doc.setFont('helvetica', 'bold')
    c.doc.setFontSize(pt)
    c.doc.setLineWidth(0.18 * c.k)
    draw(c.doc, numbers.colour)
    glyph.strokes.forEach((s, i) => {
      if (!s.number) return
      // KanjiVG numbers are baseline-left labels; centre a small bubble on them.
      const bx = x + (s.number[0] + 2.6) * scale
      const by = y + (s.number[1] - 2.8) * scale
      fill(c.doc, WHITE) // text colour shares the PDF fill colour, so reset each time
      c.doc.circle(bx, by, r, 'FD')
      ink(c.doc, numbers.colour)
      c.doc.text(String(i + 1), bx, by + pt * 0.12, { align: 'center' })
    })
  }
}

function roundRect(c: Ctx, b: Box, r: number, style: 'F' | 'S' | 'FD'): void {
  c.doc.roundedRect(b.x * c.k, b.y * c.k, b.w * c.k, b.h * c.k, r * c.k, r * c.k, style)
}

function dashedRect(c: Ctx, b: Box, r: number, colour: Rgb): void {
  draw(c.doc, colour)
  c.doc.setLineWidth(0.25 * c.k)
  c.doc.setLineDashPattern([1.2 * c.k, 1.2 * c.k], 0)
  roundRect(c, b, r, 'S')
  c.doc.setLineDashPattern([], 0)
}

// ─── Banner ──────────────────────────────────────────────────────────────────

function drawBanner(c: Ctx): void {
  const { doc, k } = c
  const box: Box = { x: M, y: BANNER_Y, w: A3_W - 2 * M, h: BANNER_H }
  const onBrand = isColour(c)
  const titleColour: Rgb = onBrand ? WHITE : INK

  if (onBrand) {
    fill(doc, BRAND)
    roundRect(c, box, 6, 'F')
  } else if (isHollow(c)) {
    draw(doc, BRAND)
    doc.setLineWidth(0.8 * k)
    roundRect(c, box, 6, 'S')
  } else {
    draw(doc, PRINT_LINE)
    doc.setLineWidth(0.3 * k)
    doc.line(M * k, (BANNER_Y + BANNER_H) * k, (A3_W - M) * k, (BANNER_Y + BANNER_H) * k)
  }

  // Script name + its native spelling (e.g. "Hiragana" + ひらがな) drawn as strokes
  const tx = box.x + 12
  text(c, c.script.label, tx, box.y + 23, 42, titleColour, { bold: true })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(fs(c, 42))
  const titleW = doc.getTextWidth(c.script.label) / k
  const kanaGlyphs = Array.from(c.script.nativeLabel)
    .map((ch) => buildGlyph(c.data, ch))
    .filter((g): g is PdfGlyph => g !== null)
  const kanaH = 21
  if (isHollow(c)) {
    let x = tx + titleW + 6
    for (const g of kanaGlyphs) {
      drawKana(c, g, { box: { x, y: box.y + 4.5, w: kanaH, h: kanaH }, colour: INK, fill: 1 })
      x += kanaH * 0.92
    }
  } else {
    drawGlyphRun(doc, kanaGlyphs, (tx + titleW + 6) * k, (box.y + 4.5) * k, kanaH * k, {
      color: hex(titleColour),
      lineWidth: kanaH * k * 0.07,
    })
  }

  const sub = onBrand ? BRAND_SOFT : isPrint(c) ? PRINT_MUTED : MUTED
  const subline = isHollow(c)
    ? 'Colour in a row each time you learn it, and tick its circle.'
    : chartSummary(c.script)
  text(c, subline, tx, box.y + 33, 11, sub)

  // Brand + fox badge on the right
  const fx = box.x + box.w - 22
  const fy = box.y + box.h / 2
  if (onBrand) {
    fill(doc, [255, 241, 232])
    doc.circle(fx * k, fy * k, 15.5 * k, 'F')
  } else {
    draw(doc, isPrint(c) ? PRINT_LINE : BRAND)
    doc.setLineWidth(0.4 * k)
    doc.circle(fx * k, fy * k, 15.5 * k, 'S')
  }
  drawFox(doc, fx * k, (fy + 1.5) * k, 11.5 * k, isColour(c) ? 'colour' : 'line')
  text(c, 'FoxSensei', fx - 20, fy - 1, 15, titleColour, { bold: true, align: 'right' })
  text(c, 'foxsensei.com', fx - 20, fy + 5.5, 9, sub, { align: 'right' })
}

// ─── Main gojūon grid ────────────────────────────────────────────────────────

function rowColour(c: Ctx, i: number): RowColour {
  if (isPrint(c)) return { band: WHITE, accent: INK }
  if (isHollow(c)) return { band: WHITE, accent: OUTLINE_INK }
  return ROW_COLOURS[i]
}

function drawBand(c: Ctx, b: Box, colours: RowColour, r = 4): void {
  if (isColour(c)) {
    fill(c.doc, colours.band)
    roundRect(c, b, r, 'F')
  } else if (isHollow(c)) {
    draw(c.doc, OUTLINE_INK)
    c.doc.setLineWidth(0.3 * c.k)
    roundRect(c, b, r, 'S')
  }
}

function drawCellFrame(c: Ctx, b: Box, r = 2.5): void {
  if (isColour(c)) {
    fill(c.doc, WHITE)
    roundRect(c, b, r, 'F')
  } else if (isPrint(c)) {
    draw(c.doc, PRINT_LINE)
    c.doc.setLineWidth(0.2 * c.k)
    roundRect(c, b, r, 'S')
  } else {
    fill(c.doc, WHITE)
    draw(c.doc, [150, 150, 150])
    c.doc.setLineWidth(0.25 * c.k)
    roundRect(c, b, r, 'FD')
  }
}

interface CellSpec {
  kana: KanaChar
  box: Box
  colours: RowColour
  romajiPt: number
  numbersPt?: number
  /** Height of the glyph area at the top of the cell. */
  glyphH: number
}

function drawKanaCell(c: Ctx, s: CellSpec): void {
  drawCellFrame(c, s.box, s.box.h > 20 ? 2.5 : 1.6)
  const glyph = buildGlyph(c.data, s.kana.character)
  const romajiColour = isPrint(c) ? INK : isHollow(c) ? INK : s.colours.accent
  const cx = s.box.x + s.box.w / 2
  if (!glyph) {
    text(c, s.kana.romaji, cx, s.box.y + s.box.h / 2 + 2.5, s.romajiPt * 1.6, romajiColour, { bold: true, align: 'center' })
    return
  }
  const gw = Math.min(s.box.w - 1, s.glyphH * (glyph.width / CELL))
  drawKana(c, glyph, {
    box: { x: cx - gw / 2, y: s.box.y + 0.6, w: gw, h: s.glyphH },
    colour: isPrint(c) ? [0, 0, 0] : INK,
    numbers: s.numbersPt
      ? { colour: isColour(c) ? s.colours.accent : isPrint(c) ? PRINT_MUTED : [120, 120, 120], pt: s.numbersPt }
      : undefined,
  })
  const label = MARK_LABELS[s.kana.id] ?? s.kana.romaji
  text(c, label, cx, s.box.y + s.box.h - s.box.h * 0.09, s.romajiPt, romajiColour, { bold: true, align: 'center' })
}

function drawGojuon(c: Ctx): void {
  const pitch = ((c.wide ? WIDE.gridBottom : GRID_BOTTOM) - GRID_TOP) / GOJUON.length
  const bandH = pitch - ROW_GAP
  const cellsX = GRID_X + LABEL_W
  const cellW = (GRID_W - LABEL_W - BAND_PAD - CELL_GAP * 4) / 5
  const cellH = bandH - BAND_PAD * 2
  const vowelColour = isColour(c) ? BRAND : isPrint(c) ? PRINT_MUTED : MUTED

  VOWELS.forEach((v, i) => {
    text(c, v, cellsX + i * (cellW + CELL_GAP) + cellW / 2, GRID_TOP - 3.5, 14, vowelColour, { bold: true, align: 'center' })
  })

  GOJUON.forEach((ids, r) => {
    const y = GRID_TOP + r * pitch
    const colours = rowColour(c, r)
    drawBand(c, { x: GRID_X, y, w: GRID_W, h: bandH }, colours)
    if (isPrint(c) && r > 0) {
      // Hairline separator between rows instead of a filled band
      draw(c.doc, [215, 215, 215])
      c.doc.setLineWidth(0.15 * c.k)
      c.doc.line(GRID_X * c.k, (y - ROW_GAP / 2) * c.k, (GRID_X + LABEL_W - 3) * c.k, (y - ROW_GAP / 2) * c.k)
    }

    // Row label (+ a tick circle on the colour-in poster)
    const lx = GRID_X + LABEL_W / 2
    const labelColour = isColour(c) ? colours.accent : INK
    if (isHollow(c)) {
      text(c, ROW_LABELS[r], lx, y + bandH / 2 - 1.5, 15, labelColour, { bold: true, align: 'center' })
      draw(c.doc, OUTLINE_INK)
      c.doc.setLineWidth(0.35 * c.k)
      c.doc.circle(lx * c.k, (y + bandH / 2 + 6) * c.k, 3 * c.k, 'S')
    } else {
      text(c, ROW_LABELS[r], lx, y + bandH / 2 + 2, 15, labelColour, { bold: true, align: 'center' })
    }

    ids.forEach((id, col) => {
      const box: Box = { x: cellsX + col * (cellW + CELL_GAP), y: y + BAND_PAD, w: cellW, h: cellH }
      const kana = id ? c.byId.get(id) : undefined
      if (!kana) {
        if (isColour(c)) dashedRect(c, box, 2.5, colours.accent)
        else dashedRect(c, box, 2.5, [190, 190, 190])
        return
      }
      drawKanaCell(c, { kana, box, colours, romajiPt: 12, numbersPt: 6.4, glyphH: cellH * 0.74 })
    })

    // ん stands alone: use the spare band for a short note
    if (ids.length === 1) {
      const nx = cellsX + cellW + CELL_GAP + 4
      const noteColour = isColour(c) ? colours.accent : isPrint(c) ? PRINT_MUTED : INK
      drawNNote(c, nx, y + bandH / 2 - 1, noteColour)
      text(c, 'The only kana that is just a consonant, never followed by a vowel.', nx, y + bandH / 2 + (c.wide ? 4.5 : 5), 9.5, isPrint(c) ? PRINT_MUTED : MUTED)
    }
  })
}

/** "ん stands alone" — the kana drawn as strokes, the rest in Helvetica. */
function drawNNote(c: Ctx, x: number, baseline: number, colour: Rgb): void {
  const glyph = buildGlyph(c.data, c.byId.get('n')?.character ?? 'ん')
  const gh = 7
  let tx = x
  if (glyph) {
    drawGlyphRun(c.doc, [glyph], x * c.k, (baseline - gh * 0.84) * c.k, gh * c.k, { color: hex(colour), lineWidth: gh * c.k * 0.08 })
    tx = x + gh * 0.95
  }
  text(c, glyph ? 'stands alone' : 'n stands alone', tx + 0.6, baseline, 12, colour, { bold: true })
}

// ─── Side panels: dakuten + combinations ─────────────────────────────────────

interface PanelSpec {
  title: string
  subtitle: string
  top: number
  rows: string[][]
  rowColours: number[]
  pitch: number
  cols: number
}

function drawPanel(c: Ctx, p: PanelSpec): number {
  const titleColour = isColour(c) ? BRAND : INK
  text(c, p.title, SIDE_X, p.top, 13, titleColour, { bold: true })
  text(c, p.subtitle, SIDE_X, p.top + 5, 8, isPrint(c) ? PRINT_MUTED : MUTED)
  const y0 = p.top + 8.5
  const bandH = p.pitch - 1.4
  const cellW = (SIDE_W - PANEL_PAD * 2 - PANEL_GAP * (p.cols - 1)) / p.cols
  const cellH = bandH - PANEL_PAD * 2
  p.rows.forEach((ids, r) => {
    const y = y0 + r * p.pitch
    const colours = rowColour(c, p.rowColours[r] ?? 0)
    drawBand(c, { x: SIDE_X, y, w: SIDE_W, h: bandH }, colours, 3)
    ids.forEach((id, col) => {
      const kana = c.byId.get(id)
      const box: Box = { x: SIDE_X + PANEL_PAD + col * (cellW + PANEL_GAP), y: y + PANEL_PAD, w: cellW, h: cellH }
      if (!kana) {
        dashedRect(c, box, 1.6, [190, 190, 190])
        return
      }
      drawKanaCell(c, { kana, box, colours, romajiPt: 8.5, glyphH: cellH * 0.7 })
    })
  })
  return y0 + p.rows.length * p.pitch
}

/** Lays `ids` out in FOREIGN_ROWS order (four across), appending any extra ids. */
function foreignRows(ids: string[]): string[][] {
  const placed = new Set(FOREIGN_ROWS.flat())
  const rows = FOREIGN_ROWS.map((row) => row.filter((id) => ids.includes(id)))
  return [...rows, ...chunk(ids.filter((id) => !placed.has(id)), 4)].filter((row) => row.length > 0)
}

/** Katakana: dakuten + foreign sounds in the side column, combinations as a full-width strip. */
function drawWidePanels(c: Ctx): void {
  const top = GRID_TOP - 6
  const titleH = 8.5
  const gap = 11
  const fRows = foreignRows(groupKanaIds(c.script, 'foreign'))
  const dRows = chunk(groupKanaIds(c.script, 'dakuten'), 5)
  // Both side panels share one row pitch, so their cells line up in size.
  const pitch = (WIDE.gridBottom - top - titleH * 2 - gap) / (dRows.length + fRows.length)
  const dakutenEnd = drawPanel(c, {
    title: 'Dakuten & handakuten',
    subtitle: 'Two small dots or a circle change the sound.',
    top,
    rows: dRows,
    rowColours: DAKUTEN_ROW_COLOUR,
    pitch,
    cols: 5,
  })
  drawPanel(c, {
    title: 'Foreign sounds',
    subtitle: 'Long mark, small tsu, and sounds for loanwords.',
    top: dakutenEnd + gap,
    rows: fRows,
    rowColours: FOREIGN_ROW_COLOUR,
    pitch,
    cols: 4,
  })
  drawComboStrip(c)
}

/** Combinations, full width under the grid: one column per row (キャ over キュ over キョ). */
function drawComboStrip(c: Ctx): void {
  const columns = chunk(groupKanaIds(c.script, 'combo'), 3)
  if (columns.length === 0) return
  const x0 = M
  const w = A3_W - 2 * M
  const titleColour = isColour(c) ? BRAND : INK
  text(c, 'Combinations', x0, WIDE.stripTop, 13, titleColour, { bold: true })
  c.doc.setFont('helvetica', 'bold')
  c.doc.setFontSize(fs(c, 13))
  const titleW = c.doc.getTextWidth('Combinations') / c.k
  text(c, 'A kana + small ya, yu or yo makes one sound.', x0 + titleW + 4, WIDE.stripTop, 8, isPrint(c) ? PRINT_MUTED : MUTED)
  const y0 = WIDE.stripTop + 3.5
  const colGap = 1.6
  const colW = (w - colGap * (columns.length - 1)) / columns.length
  const rowsPerCol = Math.max(...columns.map((col) => col.length))
  const cellH = (WIDE.stripBottom - y0 - PANEL_PAD * 2 - PANEL_GAP * (rowsPerCol - 1)) / rowsPerCol
  columns.forEach((ids, i) => {
    const x = x0 + i * (colW + colGap)
    const colours = rowColour(c, COMBO_ROW_COLOUR[i] ?? 0)
    drawBand(c, { x, y: y0, w: colW, h: WIDE.stripBottom - y0 }, colours, 3)
    ids.forEach((id, r) => {
      const kana = c.byId.get(id)
      const box: Box = { x: x + PANEL_PAD, y: y0 + PANEL_PAD + r * (cellH + PANEL_GAP), w: colW - PANEL_PAD * 2, h: cellH }
      if (!kana) {
        dashedRect(c, box, 1.6, [190, 190, 190])
        return
      }
      // A touch smaller than the cell allows, so the gojūon above stays the largest.
      drawKanaCell(c, { kana, box, colours, romajiPt: 8.5, glyphH: cellH * 0.62 })
    })
  })
}

function drawPanels(c: Ctx): void {
  if (c.wide) {
    drawWidePanels(c)
    return
  }
  const dakuten = groupKanaIds(c.script, 'dakuten')
  const combos = groupKanaIds(c.script, 'combo')
  const dakutenEnd = drawPanel(c, {
    title: 'Dakuten & handakuten',
    subtitle: 'Two small dots or a circle change the sound.',
    top: GRID_TOP - 6,
    rows: chunk(dakuten, 5),
    rowColours: DAKUTEN_ROW_COLOUR,
    pitch: 19.4,
    cols: 5,
  })
  const comboTop = dakutenEnd + 11
  const rows = chunk(combos, 3)
  drawPanel(c, {
    title: 'Combinations',
    subtitle: 'A kana + small ya, yu or yo makes one sound.',
    top: comboTop,
    rows,
    rowColours: COMBO_ROW_COLOUR,
    pitch: (GRID_BOTTOM - (comboTop + 8.5)) / rows.length,
    cols: 3,
  })
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function drawFooter(c: Ctx): void {
  const tip = isHollow(c)
    ? "Colour a row when you've learned it  ·  Learn one row a day with FoxSensei"
    : 'Small numbers show stroke order  ·  Learn one row a day with FoxSensei'
  text(c, tip, A3_W / 2, 405, 11, isColour(c) ? BRAND : INK, { bold: true, align: 'center' })
  text(c, CREDIT_LINE, A3_W / 2, 412.5, 7.5, isPrint(c) ? PRINT_MUTED : MUTED, { align: 'center' })
}

// ─── Entry ───────────────────────────────────────────────────────────────────

export function buildChartPoster(JsPDF: JsPdfCtor, data: RawStrokeData, script: KanaScriptConfig, variant: PosterVariant, kana: KanaChar[]): jsPDF {
  const a4 = variant === 'print-a4'
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: a4 ? 'a4' : 'a3' })
  doc.setProperties({ title: `FoxSensei ${script.label.toLowerCase()} chart`, creator: 'FoxSensei' })
  const c: Ctx = {
    doc,
    data,
    script,
    variant,
    k: a4 ? 210 / A3_W : 1,
    byId: new Map(kana.filter((ch) => !ch.isEmpty && ch.character).map((ch) => [ch.id, ch])),
    wide: script.groups.some((g) => g.id === 'foreign'),
  }
  drawBanner(c)
  drawGojuon(c)
  drawPanels(c)
  drawFooter(c)
  return doc
}

