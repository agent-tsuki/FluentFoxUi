/**
 * Kana chart content and stroke data per script, from the public API
 * (`GET /content/kana/{script}`), falling back to the bundled data while the
 * backend does not serve it. The bundled chart stays as the backend's seed source.
 */
import type { KanaSection } from '@/types'
import type { KanaContentData } from '@/types/content'
import type { RegisteredKanaScriptId } from '@/lib/content/kana/scriptIds'
import type { RawStrokeData } from '@/lib/pdf/glyphs'
import { mockHiraganaSections } from '@/api/mock/hiragana'
import { mockKatakanaSections } from '@/api/mock/katakana'
import { fetchStrokeJson, getStrokesBaseUrl, loadContent } from '@/api/services/contentSource'

const BUNDLED_SECTIONS: Readonly<Record<RegisteredKanaScriptId, KanaSection[]>> = {
  hiragana: mockHiraganaSections,
  katakana: mockKatakanaSections,
}

function loadKanaContent(script: RegisteredKanaScriptId): Promise<KanaContentData> {
  return loadContent<KanaContentData>(
    `/content/kana/${script}`,
    async () => ({ script, sections: BUNDLED_SECTIONS[script] }),
    // A payload without chart sections is unusable; the bundled chart beats a blank page.
    (data) => Array.isArray(data.sections),
  )
}

function isRawStrokeData(value: unknown): value is RawStrokeData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  return Object.values(value).every(
    (entry: unknown) => typeof entry === 'object' && entry !== null && Array.isArray((entry as { strokes?: unknown }).strokes),
  )
}

async function getSections(script: RegisteredKanaScriptId): Promise<KanaSection[]> {
  return (await loadKanaContent(script)).sections
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
