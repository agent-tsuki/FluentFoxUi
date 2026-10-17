/**
 * Kana path certificate (A4 landscape), one per script. Decorative kana are drawn as
 * KanjiVG strokes; all text is built-in Helvetica.
 *
 * NAME LIMITATION: jsPDF's built-in Helvetica only covers Latin-1 (WinAnsi),
 * and embedding a Japanese/Unicode font would add megabytes. So a name is
 * printed only if every character is printable Latin-1 or a kana we have
 * stroke data for in this script (drawn as strokes). Anything else (kanji, Cyrillic,
 * emoji, …) falls back to the neutral line "Awarded to the learner" rather than
 * rendering garbage.
 */
import type { jsPDF } from 'jspdf'
import { scriptKanaCount, type KanaScriptConfig } from '@/lib/content/kana/scripts'
import { buildGlyph, drawGlyphRun, drawRuns, measureRuns, toRuns, type PdfGlyph, type RawStrokeData } from '@/lib/pdf/glyphs'
import { CREDIT_LINE, GREY } from '@/lib/pdf/shared'

type JsPdfCtor = typeof jsPDF

/**
 * FoxSensei brand orange (the `primary` token's light-mode value). The PDF is
 * print art outside the themed UI, so it can't use Tailwind tokens; keep the
 * hex here and nowhere else.
 */
const BRAND_ORANGE = '#BB4D2C'
const INK = 40 // near-black text

const PAGE_W = 297
const PAGE_H = 210
const CX = PAGE_W / 2

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** e.g. "October 16, 2026" (local date). */
export function formatLongDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function scorePercent(score: number): number {
  return Number.isFinite(score) ? Math.round(Math.min(1, Math.max(0, score)) * 100) : 0
}

function drawBorder(doc: jsPDF): void {
  doc.setDrawColor(BRAND_ORANGE)
  doc.setLineWidth(1.4)
  doc.rect(9, 9, PAGE_W - 18, PAGE_H - 18, 'S')
  doc.setLineWidth(0.35)
  doc.rect(13, 13, PAGE_W - 26, PAGE_H - 26, 'S')
  // Small corner ticks inside the inner frame
  doc.setLineWidth(0.6)
  const t = 8
  const i = 17
  for (const [x, y, sx, sy] of [
    [i, i, 1, 1],
    [PAGE_W - i, i, -1, 1],
    [i, PAGE_H - i, 1, -1],
    [PAGE_W - i, PAGE_H - i, -1, -1],
  ] as const) {
    doc.line(x, y, x + t * sx, y)
    doc.line(x, y, x, y + t * sy)
  }
}

function centredText(doc: jsPDF, text: string, y: number, size: number, style: 'normal' | 'bold', grey: number): void {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
  doc.setTextColor(grey)
  doc.text(text, CX, y, { align: 'center' })
}

export interface CertificateFields {
  name: string
  score: number
  date: Date
}

export function buildCertificate(JsPDF: JsPdfCtor, data: RawStrokeData, script: KanaScriptConfig, input: CertificateFields): jsPDF {
  const title = script.certificateTitle
  const lower = script.label.toLowerCase()
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setProperties({ title, creator: 'FoxSensei' })
  drawBorder(doc)

  // Decorative script name, e.g. ひらがな
  const deco = Array.from(script.nativeLabel)
    .map((ch) => buildGlyph(data, ch))
    .filter((g): g is PdfGlyph => g !== null)
  const decoH = 15
  const decoW = deco.length * decoH * 0.92
  drawGlyphRun(doc, deco, CX - decoW / 2, 22, decoH, { color: BRAND_ORANGE, lineWidth: 0.55 })

  centredText(doc, title, 55, 28, 'bold', INK)
  doc.setDrawColor(BRAND_ORANGE)
  doc.setLineWidth(0.5)
  doc.line(CX - 30, 61, CX + 30, 61)

  // Name (see NAME LIMITATION above)
  const name = input.name.trim().replace(/\s+/g, ' ')
  const runs = name ? toRuns(data, name) : null
  let sentenceLead = 'has completed'
  if (runs) {
    centredText(doc, 'This certifies that', 79, 13, 'normal', GREY.muted)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(INK)
    let size = 30
    while (size > 14 && measureRuns(doc, runs, size) > 200) size -= 1
    const w = measureRuns(doc, runs, size)
    drawRuns(doc, runs, CX - w / 2, 97, size, { color: INK, lineWidth: size * 0.03 })
  } else {
    centredText(doc, 'Awarded to the learner', 95, 22, 'normal', INK)
    sentenceLead = 'who has completed'
  }
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.3)
  doc.line(CX - 85, 102, CX + 85, 102)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(INK)
  const lines = [
    `${sentenceLead} the FoxSensei ${lower} path`,
    `and passed the final test on all ${scriptKanaCount(script)} ${lower} with a score of ${scorePercent(input.score)}%.`,
  ]
  doc.text(lines, CX, 115, { align: 'center', lineHeightFactor: 1.5 })

  centredText(doc, formatLongDate(input.date), 143, 14, 'bold', INK)
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.3)
  doc.line(CX - 35, 146, CX + 35, 146)
  centredText(doc, 'Date', 151, 8, 'normal', GREY.muted)

  centredText(doc, 'Issued on this device · not account-verified', 180, 8.5, 'normal', GREY.muted)
  centredText(doc, CREDIT_LINE, 187, 6.5, 'normal', GREY.number)
  return doc
}

// ─── Kana master (hiragana + katakana) ───────────────────────────────────────

export const KANA_MASTER_TITLE = 'FoxSensei Kana Master Certificate'

/** One script's line on the Kana master certificate. */
export interface KanaMasterResult {
  /** "Hiragana" */
  label: string
  /** Kana covered by that script's final test. */
  kanaCount: number
  /** Best final-test score, 0–1. */
  score: number
  /** When that final test was first passed. */
  passedAt: Date
}

export interface KanaMasterFields {
  name: string
  hiragana: KanaMasterResult
  katakana: KanaMasterResult
}

/** Draws the name line (or the neutral fallback); returns the lead-in for the sentence below. */
function drawName(doc: jsPDF, data: RawStrokeData, rawName: string, top: number): string {
  const name = rawName.trim().replace(/\s+/g, ' ')
  const runs = name ? toRuns(data, name) : null
  if (runs) {
    centredText(doc, 'This certifies that', top, 13, 'normal', GREY.muted)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(INK)
    let size = 30
    while (size > 14 && measureRuns(doc, runs, size) > 200) size -= 1
    const w = measureRuns(doc, runs, size)
    drawRuns(doc, runs, CX - w / 2, top + 18, size, { color: INK, lineWidth: size * 0.03 })
    return 'has completed'
  }
  centredText(doc, 'Awarded to the learner', top + 16, 22, 'normal', INK)
  return 'who has completed'
}

function drawResultCard(doc: jsPDF, glyphs: PdfGlyph[], result: KanaMasterResult, cx: number, y: number): void {
  const w = 86
  const h = 34
  doc.setDrawColor(BRAND_ORANGE)
  doc.setLineWidth(0.35)
  doc.roundedRect(cx - w / 2, y, w, h, 3, 3, 'S')

  const gh = 8
  const gw = glyphs.length * gh * 0.92
  drawGlyphRun(doc, glyphs, cx - gw / 2, y + 3, gh, { color: BRAND_ORANGE, lineWidth: 0.4 })
  centredTextAt(doc, `${result.label} · ${scorePercent(result.score)}%`, cx, y + 18, 13, 'bold', INK)
  centredTextAt(doc, `Final test on all ${result.kanaCount} ${result.label.toLowerCase()}`, cx, y + 24.5, 9.5, 'normal', GREY.muted)
  centredTextAt(doc, `Passed ${formatLongDate(result.passedAt)}`, cx, y + 30, 9.5, 'normal', GREY.muted)
}

function centredTextAt(doc: jsPDF, text: string, x: number, y: number, size: number, style: 'normal' | 'bold', grey: number): void {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
  doc.setTextColor(grey)
  doc.text(text, x, y, { align: 'center' })
}

function glyphsOf(data: RawStrokeData, text: string): PdfGlyph[] {
  return Array.from(text)
    .map((ch) => buildGlyph(data, ch))
    .filter((g): g is PdfGlyph => g !== null)
}

/**
 * The combined certificate for passing both the hiragana and the katakana
 * final tests. Same family as buildCertificate: A4 landscape, orange frame,
 * kana drawn from KanjiVG strokes (ひらがな・カタカナ), Helvetica text. The
 * name follows the same NAME LIMITATION, with kana from either script.
 */
export function buildKanaMasterCertificate(
  JsPDF: JsPdfCtor,
  hiraganaData: RawStrokeData,
  katakanaData: RawStrokeData,
  input: KanaMasterFields,
): jsPDF {
  const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setProperties({ title: KANA_MASTER_TITLE, creator: 'FoxSensei' })
  drawBorder(doc)

  // ひらがな・カタカナ: two glyph runs with a drawn middle dot between them.
  const hiraLabel = glyphsOf(hiraganaData, 'ひらがな')
  const kataLabel = glyphsOf(katakanaData, 'カタカナ')
  const decoH = 13
  const step = decoH * 0.92
  const gap = decoH * 0.7
  const decoW = (hiraLabel.length + kataLabel.length) * step + gap
  const decoX = CX - decoW / 2
  const decoY = 21
  const afterHira = drawGlyphRun(doc, hiraLabel, decoX, decoY, decoH, { color: BRAND_ORANGE, lineWidth: 0.5 })
  doc.setFillColor(BRAND_ORANGE)
  doc.circle(afterHira + gap / 2, decoY + decoH / 2, 0.9, 'F')
  drawGlyphRun(doc, kataLabel, afterHira + gap, decoY, decoH, { color: BRAND_ORANGE, lineWidth: 0.5 })

  centredText(doc, KANA_MASTER_TITLE, 51, 26, 'bold', INK)
  doc.setDrawColor(BRAND_ORANGE)
  doc.setLineWidth(0.5)
  doc.line(CX - 30, 57, CX + 30, 57)

  const lead = drawName(doc, { ...hiraganaData, ...katakanaData }, input.name, 70)
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.3)
  doc.line(CX - 85, 93, CX + 85, 93)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(INK)
  doc.text(`${lead} the FoxSensei hiragana and katakana paths and passed both final tests.`, CX, 104, { align: 'center' })

  drawResultCard(doc, glyphsOf(hiraganaData, 'ひらがな'), input.hiragana, CX - 48, 112)
  drawResultCard(doc, glyphsOf(katakanaData, 'カタカナ'), input.katakana, CX + 48, 112)

  // Kana master since the later of the two passes.
  const earned = new Date(Math.max(input.hiragana.passedAt.getTime(), input.katakana.passedAt.getTime()))
  centredText(doc, formatLongDate(earned), 163, 14, 'bold', INK)
  doc.setDrawColor(GREY.cellBorder)
  doc.setLineWidth(0.3)
  doc.line(CX - 35, 166, CX + 35, 166)
  centredText(doc, 'Kana master since', 171, 8, 'normal', GREY.muted)

  centredText(doc, 'Issued on this device · not account-verified', 183, 8.5, 'normal', GREY.muted)
  centredText(doc, CREDIT_LINE, 189, 6.5, 'normal', GREY.number)
  return doc
}
