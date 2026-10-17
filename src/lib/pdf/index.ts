// Load with `await import('@/lib/pdf')`. jsPDF and the script's KanjiVG stroke
// data are imported dynamically inside each function so they stay out of page
// bundles. Every function builds the PDF in the browser and triggers a
// download; errors propagate to the caller. Labels, units, sample words and
// stroke data all come from the script config passed in.
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import type { RawStrokeData } from '@/lib/pdf/glyphs'
import type { KanjiEntry, KanjiStrokeData, KanjiUnit } from '@/types/kanji'

export interface CertificateInput {
  name: string
  /** Final test score, 0–1. */
  score: number
  date: Date
}

async function loadDeps(script: KanaScriptConfig) {
  const [{ jsPDF }, data] = await Promise.all([import('jspdf'), script.loadStrokes()])
  return { jsPDF, data }
}

/** Tracing sheet + mini test for one unit. `kana` are that unit's characters, in order. */
export async function generateUnitWorksheet(script: KanaScriptConfig, unit: KanaUnit, kana: KanaChar[]): Promise<void> {
  const [{ jsPDF, data }, { buildUnitWorksheet }] = await Promise.all([loadDeps(script), import('@/lib/pdf/worksheet')])
  buildUnitWorksheet(jsPDF, data, script, unit, kana).save(`foxsensei-${script.pdfSlug}-${unit.id}.pdf`)
}

/**
 * The script's course certificate. (A combined "Kana master" certificate can
 * reuse buildCertificate with both scripts' results; see getFinalTests in
 * learningPathService.)
 */
export async function generateCertificate(script: KanaScriptConfig, { name, score, date }: CertificateInput): Promise<void> {
  const [{ jsPDF, data }, { buildCertificate }] = await Promise.all([loadDeps(script), import('@/lib/pdf/certificate')])
  buildCertificate(jsPDF, data, script, { name, score, date }).save(`foxsensei-${script.pdfSlug}-certificate.pdf`)
}

export type PosterVariant = 'colour-a3' | 'print-a4' | 'colour-in-a3'

const POSTER_FILES: Record<PosterVariant, string> = {
  'colour-a3': 'poster-a3',
  'print-a4': 'chart-a4',
  'colour-in-a3': 'colour-in-a3',
}

/** One-page chart of the script. `kana` is every kana of the script (any order; spacers ignored). */
export async function generateChartPoster(script: KanaScriptConfig, variant: PosterVariant, kana: KanaChar[]): Promise<void> {
  const [{ jsPDF, data }, { buildChartPoster }] = await Promise.all([loadDeps(script), import('@/lib/pdf/poster')])
  buildChartPoster(jsPDF, data, script, variant, kana).save(`foxsensei-${script.pdfSlug}-${POSTER_FILES[variant]}.pdf`)
}

export interface KanaMasterScriptInput {
  label: string
  kanaCount: number
  /** Best final-test score, 0–1. */
  score: number
  passedAt: Date
}

/**
 * The combined Kana master certificate (both final tests passed). Loads both
 * scripts' stroke data itself, so it works from either course.
 */
export async function generateKanaMasterCertificate(input: {
  name: string
  hiragana: KanaMasterScriptInput
  katakana: KanaMasterScriptInput
}): Promise<void> {
  const [{ jsPDF }, hiragana, katakana, { buildKanaMasterCertificate }] = await Promise.all([
    import('jspdf'),
    import('@/assets/kana-strokes/hiragana.json').then((m) => m.default as RawStrokeData),
    import('@/assets/kana-strokes/katakana.json').then((m) => m.default as RawStrokeData),
    import('@/lib/pdf/certificate'),
  ])
  buildKanaMasterCertificate(jsPDF, hiragana, katakana, input).save('foxsensei-kana-master-certificate.pdf')
}

export interface KanjiWorksheetRequest {
  levelTitle: string
  /** File-name slug, e.g. "kanji-n5". */
  pdfSlug: string
  unit: KanjiUnit
  unitNumber: number
  entries: KanjiEntry[]
  /** KanjiVG strokes of the unit's kanji (and of kanji in their key words), by character. */
  strokes: Record<string, KanjiStrokeData>
}

/** Trace-and-write sheet for one kanji unit. Kana stroke data is loaded here for readings. */
export async function generateKanjiWorksheet(req: KanjiWorksheetRequest): Promise<void> {
  const [{ jsPDF }, hiragana, katakana, { buildKanjiWorksheet }] = await Promise.all([
    import('jspdf'),
    import('@/assets/kana-strokes/hiragana.json').then((m) => m.default as RawStrokeData),
    import('@/assets/kana-strokes/katakana.json').then((m) => m.default as RawStrokeData),
    import('@/lib/pdf/kanjiWorksheet'),
  ])
  const data: RawStrokeData = { ...hiragana, ...katakana, ...req.strokes }
  buildKanjiWorksheet(jsPDF, { levelTitle: req.levelTitle, unit: req.unit, unitNumber: req.unitNumber, entries: req.entries, data }).save(
    `foxsensei-${req.pdfSlug}-${req.unit.id}.pdf`,
  )
}

export interface KanjiCertificateRequest {
  title: string
  levelLabel: string
  kanjiCount: number
  pdfSlug: string
  name: string
  score: number
  date: Date
  /** Strokes of 漢 and 字 for the heading (missing ones are left out). */
  strokes: Record<string, KanjiStrokeData>
}

/** A kanji level's certificate (level test passed). */
export async function generateKanjiCertificate(req: KanjiCertificateRequest): Promise<void> {
  const [{ jsPDF }, hiragana, katakana, { buildKanjiCertificate }] = await Promise.all([
    import('jspdf'),
    import('@/assets/kana-strokes/hiragana.json').then((m) => m.default as RawStrokeData),
    import('@/assets/kana-strokes/katakana.json').then((m) => m.default as RawStrokeData),
    import('@/lib/pdf/certificate'),
  ])
  const data: RawStrokeData = { ...hiragana, ...katakana, ...req.strokes }
  buildKanjiCertificate(jsPDF, data, req).save(`foxsensei-${req.pdfSlug}-certificate.pdf`)
}
