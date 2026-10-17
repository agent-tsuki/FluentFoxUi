/**
 * Kana unit worksheet (A4 portrait, any script): tracing rows, a mini test and an
 * answer key. Every kana is drawn as KanjiVG vector strokes (see strokes.ts);
 * Helvetica is used only for Latin text. Black/grey only so it prints well.
 */
import type { jsPDF } from 'jspdf'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import {
  buildGlyph,
  drawGlyph,
  drawGlyphRun,
  drawRuns,
  toRuns,
  type Box,
  type PdfGlyph,
  type RawStrokeData,
} from '@/lib/pdf/glyphs'
import { CREDIT_LINE, GREY, shuffle } from '@/lib/pdf/shared'
import { isKanaMark } from '@/lib/content/kana/kanaMarks'

type JsPdfCtor = typeof jsPDF

// ─── Page geometry (mm) ──────────────────────────────────────────────────────
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
const CONTENT_W = PAGE_W - MARGIN * 2
const RIGHT = PAGE_W - MARGIN
const CONTENT_TOP = 44
const CONTENT_BOTTOM = PAGE_H - 16 // footer sits below this

const LABEL_W = 11
const CELL = 19 // square cell for single kana (≥18 mm so children can write)
const WIDE_CELL = 28 // compound kana (きゃ) need a wider box
const ROWS_PER_PAGE = 5
const TRACE_SINGLE = 5
const PRACTICE_SINGLE = 3
// Compounds: 1 + 3 + 2 wide cells fill the same width as 1 + 5 + 3 square ones.
const TRACE_WIDE = 3
const PRACTICE_WIDE = 2

const MODEL_LINE = 0.7
const TRACE_LINE = 0.5

interface Item {
  kana: KanaChar
  glyph: PdfGlyph | null
}

/** The sound label printed for a kana: its romaji, or a word for katakana's ー / ッ. */
function soundLabel(kana: KanaChar): string {
  if (kana.id === 'long') return 'long'
  if (kana.id === 'sokuon') return 'pause'
  return kana.romaji
}

/** Labels longer than a syllable print smaller so they stay clear of the boxes. */
const labelSize = (label: string, size: number) => (label.length > 3 ? size * 0.7 : size)

// ─── Small drawing helpers ───────────────────────────────────────────────────

function drawCell(doc: jsPDF, box: Box, border: number = GREY.cellBorder): void {
  doc.setLineDashPattern([], 0)
  doc.setDrawColor(border)
  doc.setLineWidth(0.3)
  doc.rect(box.x, box.y, box.w, box.h, 'S')
  // Dashed centre cross
  doc.setDrawColor(GREY.guide)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(box.x + box.w / 2, box.y, box.x + box.w / 2, box.y + box.h)
  doc.line(box.x, box.y + box.h / 2, box.x + box.w, box.y + box.h / 2)
  doc.setLineDashPattern([], 0)
}

function setText(doc: jsPDF, size: number, style: 'normal' | 'bold' = 'normal', grey: number = GREY.text): void {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
  doc.setTextColor(grey)
}

function sectionHeading(doc: jsPDF, y: number, title: string, hint?: string): number {
  setText(doc, 11, 'bold')
  doc.text(title, MARGIN, y)
  if (hint) {
    setText(doc, 8, 'normal', GREY.muted)
    doc.text(hint, MARGIN, y + 4.5)
    return y + 9
  }
  return y + 5
}

function drawHeader(doc: jsPDF, data: RawStrokeData, script: KanaScriptConfig, unit: KanaUnit): void {
  setText(doc, 8.5, 'bold', GREY.muted)
  doc.text(`FoxSensei · ${script.label} worksheet`, MARGIN, 19)

  // Unit title: Latin parts as Helvetica, kana drawn as strokes, other glyphs (゛゜) dropped.
  setText(doc, 20, 'bold')
  const runs = toRuns(data, unit.title, true) ?? []
  drawRuns(doc, runs, MARGIN, 30, 20, { color: GREY.text, lineWidth: 0.75 })

  // Name / Date fields
  setText(doc, 9, 'normal', GREY.muted)
  doc.text('Name', 98, 30)
  doc.text('Date', 160, 30)
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.3)
  doc.line(108, 30.8, 155, 30.8)
  doc.line(169, 30.8, RIGHT, 30.8)

  doc.setDrawColor(GREY.rule)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, 35, RIGHT, 35)
}

function addPage(doc: jsPDF, data: RawStrokeData, script: KanaScriptConfig, unit: KanaUnit, first = false): number {
  if (!first) doc.addPage()
  drawHeader(doc, data, script, unit)
  return CONTENT_TOP
}

function drawFooters(doc: jsPDF): void {
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setDrawColor(GREY.rule)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, PAGE_H - 12, RIGHT, PAGE_H - 12)
    setText(doc, 7, 'normal', GREY.muted)
    doc.text(CREDIT_LINE, MARGIN, PAGE_H - 8)
    doc.text(`Page ${p} of ${total}`, RIGHT, PAGE_H - 8, { align: 'right' })
  }
}

// ─── Tracing section ─────────────────────────────────────────────────────────

function drawTracingRow(doc: jsPDF, item: Item, y: number): void {
  const wide = item.kana.character.length > 1
  const cw = wide ? WIDE_CELL : CELL
  const traces = wide ? TRACE_WIDE : TRACE_SINGLE
  const practice = wide ? PRACTICE_WIDE : PRACTICE_SINGLE
  const count = 1 + traces + practice
  const gap = (CONTENT_W - LABEL_W - count * cw) / (count - 1)

  // Romaji label + stroke count
  const label = soundLabel(item.kana)
  setText(doc, labelSize(label, 13), 'bold')
  doc.text(label, MARGIN, y + CELL / 2 + 1)
  if (item.glyph) {
    const n = item.glyph.strokes.length
    setText(doc, 6.5, 'normal', GREY.muted)
    doc.text(`${n} stroke${n === 1 ? '' : 's'}`, MARGIN, y + CELL / 2 + 5)
  }

  for (let c = 0; c < count; c++) {
    const box: Box = { x: MARGIN + LABEL_W + c * (cw + gap), y, w: cw, h: CELL }
    drawCell(doc, box, c === 0 ? GREY.modelBorder : GREY.cellBorder)
    if (!item.glyph || c > traces) continue
    if (c === 0) {
      drawGlyph(doc, item.glyph, box, {
        color: GREY.text,
        lineWidth: MODEL_LINE,
        fill: 0.86,
        numbers: { color: GREY.number, fontSize: 5.5 },
      })
    } else {
      drawGlyph(doc, item.glyph, box, { color: GREY.trace, lineWidth: TRACE_LINE, fill: 0.86 })
    }
  }
}

function drawTracingPages(doc: jsPDF, data: RawStrokeData, script: KanaScriptConfig, unit: KanaUnit, items: Item[]): void {
  for (let start = 0; start < items.length; start += ROWS_PER_PAGE) {
    let y = addPage(doc, data, script, unit, start === 0)
    y = sectionHeading(
      doc,
      y,
      'Trace and write',
      'Copy the stroke order from the first box, trace the grey kana, then write it on your own.',
    )
    const rows = items.slice(start, start + ROWS_PER_PAGE)
    // Spread rows evenly over the page so the writing space is generous.
    const pitch = Math.min(44, (CONTENT_BOTTOM - y - 4) / ROWS_PER_PAGE)
    rows.forEach((item, i) => drawTracingRow(doc, item, y + 4 + i * pitch))
  }
}

// ─── Mini test + answer key ──────────────────────────────────────────────────

interface SampleWord {
  glyphs: PdfGlyph[]
  romaji: string
  meaning: string
}

/** Glyphs for every character, or null if any can't be drawn. */
function glyphsFor(data: RawStrokeData, chars: string[]): PdfGlyph[] | null {
  const glyphs = chars.map((ch) => buildGlyph(data, ch))
  return glyphs.every((g): g is PdfGlyph => g !== null) ? glyphs : null
}

/**
 * First unit kana whose sample word is fully drawable (basic rows; katakana's
 * ー/ッ have one too). Failing that, a katakana loanword ('extended' word, e.g.
 * フォーク for the foreign sounds) that uses one of the unit's kana.
 */
function pickSampleWord(data: RawStrokeData, script: KanaScriptConfig, items: Item[]): SampleWord | null {
  for (const { kana } of items) {
    const entry = script.sampleWords[kana.id]
    const m = entry?.word.match(/^(\S+)\s*\((.+)\)\s*$/)
    if (!entry || !m) continue
    const glyphs = glyphsFor(data, Array.from(m[1]))
    if (glyphs) return { glyphs, romaji: m[2], meaning: entry.meaning }
  }
  const unitChars = new Set(items.map((i) => i.kana.character))
  for (const word of shuffle(script.practiceWords.filter((w) => w.tier === 'extended' && w.kana.length <= 6))) {
    if (!word.kana.some((c) => unitChars.has(c))) continue
    const glyphs = glyphsFor(data, word.kana)
    if (glyphs) return { glyphs, romaji: word.romaji, meaning: word.meaning }
  }
  return null
}

const LETTERS = 'ABCDEFGHIJ'

function drawTestPage(doc: jsPDF, data: RawStrokeData, script: KanaScriptConfig, unit: KanaUnit, items: Item[]): void {
  const drawable = items.filter((i): i is Item & { glyph: PdfGlyph } => i.glyph !== null)
  const wide = items.some((i) => i.kana.character.length > 1)
  const basic = items.every((i) => i.kana.type === 'basic')
  const lower = script.label.toLowerCase()

  let y = addPage(doc, data, script, unit)
  setText(doc, 14, 'bold')
  doc.text('Mini test', MARGIN, y + 1)
  y += 9

  // (a) Write the kana
  const writeItems = shuffle(drawable).slice(0, 10)
  y = sectionHeading(doc, y, `1  Write the ${lower}`, `Write the ${lower} for each sound in its box.`)
  const perRow = wide ? 4 : 5
  const colW = CONTENT_W / perRow
  const boxW = wide ? WIDE_CELL : CELL
  writeItems.forEach((it, i) => {
    const col = i % perRow
    const row = Math.floor(i / perRow)
    const x = MARGIN + col * colW
    const top = y + 2 + row * (CELL + 5)
    setText(doc, 8, 'normal', GREY.muted)
    doc.text(`${i + 1}.`, x, top + CELL / 2 + 1.2)
    const label = soundLabel(it.kana)
    setText(doc, labelSize(label, 12), 'bold')
    doc.text(label, x + 5, top + CELL / 2 + 1.5)
    drawCell(doc, { x: x + (wide ? 16 : 14.5), y: top, w: boxW, h: CELL })
  })
  y += 2 + Math.ceil(writeItems.length / perRow) * (CELL + 5) + 4

  // (b) Match
  const matchItems = shuffle(drawable).slice(0, 5)
  const romajiOrder = shuffle(matchItems)
  y = sectionHeading(doc, y, '2  Match', `Draw a line from each ${lower} to its sound.`)
  const matchPitch = 16
  const glyphBox = 13
  matchItems.forEach((it, i) => {
    const top = y + 1 + i * matchPitch
    const mid = top + glyphBox / 2
    setText(doc, 8, 'normal', GREY.muted)
    doc.text(`${i + 1}.`, MARGIN + 8, mid + 1.2)
    const w = it.kana.character.length > 1 ? glyphBox * 1.45 : glyphBox
    drawGlyph(doc, it.glyph, { x: MARGIN + 15, y: top, w, h: glyphBox }, { color: GREY.text, lineWidth: 0.55, fill: 0.95 })
    doc.setFillColor(GREY.text, GREY.text, GREY.text)
    doc.circle(MARGIN + 40, mid, 0.8, 'F')
    doc.circle(MARGIN + 110, mid, 0.8, 'F')
    setText(doc, 8, 'normal', GREY.muted)
    doc.text(LETTERS[i], MARGIN + 116, mid + 1.2)
    setText(doc, 12, 'bold')
    doc.text(soundLabel(romajiOrder[i].kana), MARGIN + 123, mid + 1.5)
  })
  y += 1 + matchItems.length * matchPitch + 4

  // (c) Read a word (basic rows, katakana's marks, and units a loanword can show)
  const word = basic || items.some((i) => isKanaMark(i.kana)) || script.practiceWords.some((w) => w.tier === 'extended')
    ? pickSampleWord(data, script, items)
    : null
  if (word) {
    y = sectionHeading(doc, y, '3  Read', 'Read the word and write it in romaji.')
    const h = 13
    const end = drawGlyphRun(doc, word.glyphs, MARGIN + 8, y, h, { color: GREY.text, lineWidth: 0.55 })
    setText(doc, 12, 'normal')
    doc.text('=', end + 6, y + h / 2 + 1.5)
    doc.setDrawColor(GREY.cellBorder)
    doc.setLineWidth(0.3)
    doc.line(end + 13, y + h / 2 + 2, end + 75, y + h / 2 + 2)
    y += h + 6
  }

  // Answer key: on this page if it fits, otherwise on its own page.
  const keyHeight = 40
  if (y + keyHeight > CONTENT_BOTTOM) y = addPage(doc, data, script, unit)
  else y = CONTENT_BOTTOM - keyHeight
  drawAnswerKey(doc, y, writeItems, matchItems, romajiOrder, word)
}

function drawAnswerKey(
  doc: jsPDF,
  y: number,
  writeItems: (Item & { glyph: PdfGlyph })[],
  matchItems: Item[],
  romajiOrder: Item[],
  word: SampleWord | null,
): void {
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([2, 1.5], 0)
  doc.line(MARGIN, y, RIGHT, y)
  doc.setLineDashPattern([], 0)
  setText(doc, 7, 'normal', GREY.muted)
  doc.text('fold or cut here', RIGHT, y - 1.2, { align: 'right' })

  y += 7
  setText(doc, 9.5, 'bold')
  doc.text('Answer key', MARGIN, y)

  // 1: numbered small glyphs
  y += 7
  setText(doc, 8, 'bold', GREY.muted)
  doc.text('1', MARGIN, y)
  const h = 7
  let x = MARGIN + 6
  writeItems.forEach((it, i) => {
    setText(doc, 7.5, 'normal', GREY.muted)
    doc.text(`${i + 1}.`, x, y)
    x = drawGlyphRun(doc, [it.glyph], x + 3.5, y - h + 1.6, h, { color: GREY.text, lineWidth: 0.35 }) + 3.5
  })

  // 2: match pairs
  y += 8
  setText(doc, 8, 'bold', GREY.muted)
  doc.text('2', MARGIN, y)
  setText(doc, 9, 'normal')
  const pairs = matchItems.map((it, i) => `${i + 1} – ${LETTERS[romajiOrder.findIndex((r) => r.kana.id === it.kana.id)]}`)
  doc.text(pairs.join('     '), MARGIN + 6, y)

  // 3: the word
  if (word) {
    y += 8
    setText(doc, 8, 'bold', GREY.muted)
    doc.text('3', MARGIN, y)
    setText(doc, 9, 'normal')
    doc.text(`${word.romaji} – "${word.meaning}"`, MARGIN + 6, y)
  }
}

// ─── Entry ───────────────────────────────────────────────────────────────────

export function buildUnitWorksheet(
  JsPDF: JsPdfCtor,
  data: RawStrokeData,
  script: KanaScriptConfig,
  unit: KanaUnit,
  kana: KanaChar[],
): jsPDF {
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setProperties({ title: `FoxSensei ${script.label.toLowerCase()} worksheet: ${unit.id}`, creator: 'FoxSensei' })
  const items: Item[] = kana.filter((k) => !k.isEmpty).map((k) => ({ kana: k, glyph: buildGlyph(data, k.character) }))
  drawTracingPages(doc, data, script, unit, items)
  drawTestPage(doc, data, script, unit, items)
  drawFooters(doc)
  return doc
}
