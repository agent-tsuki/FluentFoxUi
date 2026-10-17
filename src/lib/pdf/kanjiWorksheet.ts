/**
 * Kanji unit worksheet (A4 portrait): for each kanji, a model box with stroke
 * numbers, its meaning, key reading and stroke count, then grey boxes to trace
 * and empty boxes to write in. Kanji and kana are drawn as KanjiVG strokes;
 * Helvetica is only used for Latin text. Black/grey only so it prints well.
 */
import type { jsPDF } from 'jspdf'
import type { KanjiEntry, KanjiUnit } from '@/types/kanji'
import { buildGlyph, drawGlyph, drawRuns, toRuns, type Box, type RawStrokeData } from '@/lib/pdf/glyphs'
import { CREDIT_LINE, GREY } from '@/lib/pdf/shared'

type JsPdfCtor = typeof jsPDF

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
const RIGHT = PAGE_W - MARGIN
const CONTENT_W = PAGE_W - MARGIN * 2
const CONTENT_TOP = 44
const ROWS_PER_PAGE = 5
const CELL = 21
const CELLS = 8 // 1 model + 3 trace + 4 blank
const TRACES = 3
const ROW_PITCH = 46

/** KANJIDIC2 / JMdict credit, required alongside the KanjiVG line. */
export const KANJI_DATA_CREDIT = 'Kanji data: KANJIDIC2 & JMdict (EDRDG, CC BY-SA 4.0)'

export interface KanjiWorksheetInput {
  /** "N5 Kanji" */
  levelTitle: string
  unit: KanjiUnit
  unitNumber: number
  entries: KanjiEntry[]
  /** Kana + the unit's kanji stroke data, keyed by character. */
  data: RawStrokeData
}

function setText(doc: jsPDF, size: number, style: 'normal' | 'bold' = 'normal', grey: number = GREY.text): void {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
  doc.setTextColor(grey)
}

function drawCell(doc: jsPDF, box: Box, border: number): void {
  doc.setLineDashPattern([], 0)
  doc.setDrawColor(border)
  doc.setLineWidth(0.3)
  doc.rect(box.x, box.y, box.w, box.h, 'S')
  doc.setDrawColor(GREY.guide)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([1, 1], 0)
  doc.line(box.x + box.w / 2, box.y, box.x + box.w / 2, box.y + box.h)
  doc.line(box.x, box.y + box.h / 2, box.x + box.w, box.y + box.h / 2)
  doc.setLineDashPattern([], 0)
}

function drawHeader(doc: jsPDF, input: KanjiWorksheetInput): void {
  setText(doc, 8.5, 'bold', GREY.muted)
  doc.text(`FoxSensei · ${input.levelTitle} worksheet · Unit ${input.unitNumber}`, MARGIN, 19)
  setText(doc, 20, 'bold')
  doc.text(input.unit.title, MARGIN, 30)
  setText(doc, 9, 'normal', GREY.muted)
  doc.text('Name', 98, 30)
  doc.text('Date', 160, 30)
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.3)
  doc.line(108, 30.8, 155, 30.8)
  doc.line(169, 30.8, RIGHT, 30.8)
  doc.setDrawColor(GREY.rule)
  doc.line(MARGIN, 35, RIGHT, 35)
}

function drawRow(doc: jsPDF, entry: KanjiEntry, data: RawStrokeData, y: number): void {
  // Label line: meaning · key word (reading) · strokes
  const key = entry.vocab.find((v) => v.isKey) ?? entry.vocab[0]
  setText(doc, 11, 'bold')
  doc.text(entry.meanings[0], MARGIN, y)
  const meaningW = doc.getTextWidth(entry.meanings[0])
  setText(doc, 9, 'normal', GREY.muted)
  const label = key ? `  ·  ${key.word} ${key.reading} (${key.meaning.split(';')[0]})` : ''
  const runs = toRuns(data, label, true)
  if (runs) drawRuns(doc, runs, MARGIN + meaningW, y, 9, { color: GREY.muted, lineWidth: 0.3 })
  doc.text(`${entry.strokes} strokes`, RIGHT, y, { align: 'right' })

  const glyph = buildGlyph(data, entry.char)
  const gap = (CONTENT_W - CELLS * CELL) / (CELLS - 1)
  const top = y + 4
  for (let c = 0; c < CELLS; c++) {
    const box: Box = { x: MARGIN + c * (CELL + gap), y: top, w: CELL, h: CELL }
    drawCell(doc, box, c === 0 ? GREY.modelBorder : GREY.cellBorder)
    if (!glyph || c > TRACES) continue
    drawGlyph(
      doc,
      glyph,
      box,
      c === 0
        ? { color: GREY.text, lineWidth: 0.6, fill: 0.86, numbers: { color: GREY.number, fontSize: 5 } }
        : { color: GREY.trace, lineWidth: 0.45, fill: 0.86 },
    )
  }
}

function drawFooters(doc: jsPDF): void {
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setDrawColor(GREY.rule)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, PAGE_H - 14, RIGHT, PAGE_H - 14)
    setText(doc, 6.5, 'normal', GREY.muted)
    doc.text(CREDIT_LINE, MARGIN, PAGE_H - 10)
    doc.text(KANJI_DATA_CREDIT, MARGIN, PAGE_H - 6.5)
    doc.text(`Page ${p} of ${total}`, RIGHT, PAGE_H - 10, { align: 'right' })
  }
}

export function buildKanjiWorksheet(JsPDF: JsPdfCtor, input: KanjiWorksheetInput): jsPDF {
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setProperties({ title: `${input.levelTitle} · ${input.unit.title} worksheet`, creator: 'FoxSensei' })
  for (let start = 0; start < input.entries.length; start += ROWS_PER_PAGE) {
    if (start > 0) doc.addPage()
    drawHeader(doc, input)
    setText(doc, 11, 'bold')
    doc.text('Trace and write', MARGIN, CONTENT_TOP)
    setText(doc, 8, 'normal', GREY.muted)
    doc.text('Copy the stroke order from the first box, trace the grey kanji, then write it on your own.', MARGIN, CONTENT_TOP + 4.5)
    input.entries.slice(start, start + ROWS_PER_PAGE).forEach((entry, i) => drawRow(doc, entry, input.data, CONTENT_TOP + 14 + i * ROW_PITCH))
  }
  drawFooters(doc)
  return doc
}
