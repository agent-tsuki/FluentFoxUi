/**
 * Kana chart content and stroke data per script, from the public API
 * (`GET /content/kana/{script}`), falling back to the bundled data while the
 * backend does not serve it. The bundled chart stays as the backend's seed source.
 */
import type { KanaSection } from '@/types'
import type { KanaContentData } from '@/types/content'
import type { RegisteredKanaScriptId } from '@/lib/content/kana/scriptIds'
import { buildKanaSections } from '@/lib/content/kana/buildKanaSections'
import type { RawStrokeData } from '@/lib/pdf/glyphs'
import { mockHiraganaSections } from '@/api/mock/hiragana'
import { mockKatakanaSections } from '@/api/mock/katakana'
import { fetchStrokeJson, getStrokesBaseUrl, loadContent } from '@/api/services/contentSource'

const BUNDLED_SECTIONS: Readonly<Record<RegisteredKanaScriptId, KanaSection[]>> = {
  hiragana: mockHiraganaSections,
  katakana: mockKatakanaSections,
}

const SCRIPT_LABELS: Readonly<Record<RegisteredKanaScriptId, string>> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
}

/** The bundled chart, already laid out; used while the API does not serve the script. */
interface BundledKanaContent {
  script: RegisteredKanaScriptId
  sections: KanaSection[]
}

type KanaContentPayload = KanaContentData | BundledKanaContent

function isBundled(data: KanaContentPayload): data is BundledKanaContent {
  return 'sections' in data
}

function loadKanaContent(script: RegisteredKanaScriptId): Promise<KanaContentPayload> {
  return loadContent<KanaContentPayload>(
    `/content/kana/${script}`,
    async () => ({ script, sections: BUNDLED_SECTIONS[script] }),
    // A payload without kana is unusable; the bundled chart beats a blank page.
    (data) => isBundled(data) || (Array.isArray(data.kana) && data.kana.length > 0),
  )
}

function isRawStrokeData(value: unknown): value is RawStrokeData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return Object.values(value).every(
    (entry: unknown) => typeof entry === 'object' && entry !== null && Array.isArray((entry as { strokes?: unknown }).strokes),
  )
}

const sectionsCache = new Map<RegisteredKanaScriptId, KanaSection[]>()

async function getSections(script: RegisteredKanaScriptId): Promise<KanaSection[]> {
  const data = await loadKanaContent(script)
  if (isBundled(data)) return data.sections
  let sections = sectionsCache.get(script)
  if (!sections) {
    sections = buildKanaSections(data.kana, SCRIPT_LABELS[script])
    sectionsCache.set(script, sections)
  }
  return sections
}

/**
 * The whole script's stroke file. R2 keeps it at `<strokes_base_url>/kana/<script>.json`;
 * without a base URL, or when R2 fails, the bundled file is used.
 */
async function getStrokes(script: RegisteredKanaScriptId, bundled: () => Promise<RawStrokeData>): Promise<RawStrokeData> {
  // The content response carries the R2 base URL; it is cached, so this is usually free.
  await loadKanaContent(script)
  const base = getStrokesBaseUrl()
  if (base) {
    const remote = await fetchStrokeJson(`${base}/kana/${script}.json`).catch(() => null)
    if (isRawStrokeData(remote)) return remote
  }
  return bundled()
}

export const kanaContentService = {
  getSections,
  getStrokes,
}
