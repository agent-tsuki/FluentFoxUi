import type {
  KanjiEntry,
  KanjiIndexRow,
  KanjiLevelDetail,
  KanjiLevelId,
  KanjiLevelIndex,
  KanjiLevelStatus,
  KanjiLevelSummary,
  KanjiSearchFilters,
  KanjiStrokeData,
} from '@/types/kanji'
import { KANJI_LEVELS, availableKanjiLevels, kanjiLevelMeta } from '@/lib/content/kanji/levels'
import { KANJI_LEVEL_CONFIGS } from '@/lib/content/kanji/levelConfigs'
import { toHiragana } from '@/lib/content/kanji/kanjiText'
import { fetchStrokeJson, getStrokesBaseUrl, loadContent } from '@/api/services/contentSource'

/**
 * Kanji data service: an API-shaped async contract, so the UI never changes
 * when a level moves from bundled JSON to the API.
 *
 * - Available levels load from the public API
 *   (`/content/kanji/{level}/index|detail`, `/content/kanji/chars/{char}`) and
 *   fall back to the lazily-imported bundled JSON when the API does not serve
 *   the level yet (v1 serves N5 only) or is unreachable.
 * - Coming-soon levels (N3–N1) throw `LevelUnavailableError`.
 * - Strokes come from R2 (`strokes_base_url` of the content responses) when
 *   known, else from `public/kanji-data/<version>/strokes/`.
 * - getLevels and search are derived from the level indexes on the client.
 */

/** Version folder of the static stroke files (bump when the data is regenerated). */
export const KANJI_DATA_VERSION = 'v1'

/** Thrown for a level that has no data yet (coming soon). Pages show a "Coming soon" state, never a crash. */
export class LevelUnavailableError extends Error {
  readonly level: KanjiLevelId
  readonly status: KanjiLevelStatus

  constructor(level: KanjiLevelId, status: KanjiLevelStatus = kanjiLevelMeta(level).status) {
    super(`${kanjiLevelMeta(level).label} kanji are not available yet.`)
    this.name = 'LevelUnavailableError'
    this.level = level
    this.status = status
  }
}

export function isLevelUnavailableError(err: unknown): err is LevelUnavailableError {
  return err instanceof LevelUnavailableError
}

/** KanjiVG file name for a kanji: 日 → 065e5. */
export function kanjiStrokeFileId(char: string): string {
  return (char.codePointAt(0) ?? 0).toString(16).padStart(5, '0')
}

function isLevelAvailable(level: KanjiLevelId): boolean {
  return KANJI_LEVEL_CONFIGS[level].status === 'available'
}

function bundledLoadersFor(level: KanjiLevelId) {
  const config = KANJI_LEVEL_CONFIGS[level]
  if (config.status !== 'available' || !config.bundled) throw new LevelUnavailableError(level)
  return config.bundled
}

async function getLevelIndex(level: KanjiLevelId): Promise<KanjiLevelIndex> {
  if (!isLevelAvailable(level)) throw new LevelUnavailableError(level)
  return loadContent(`/content/kanji/${level}/index`, () => bundledLoadersFor(level).loadIndex(), (d) => Array.isArray(d.rows))
}

async function getLevelDetail(level: KanjiLevelId): Promise<KanjiLevelDetail> {
  if (!isLevelAvailable(level)) throw new LevelUnavailableError(level)
  return loadContent(`/content/kanji/${level}/detail`, () => bundledLoadersFor(level).loadDetail(), (d) => Array.isArray(d.entries))
}

/** Indexes of the given levels that have data (unavailable levels are skipped, not thrown). */
async function loadIndexes(levels: readonly KanjiLevelId[]): Promise<KanjiLevelIndex[]> {
  return Promise.all(levels.filter(isLevelAvailable).map(getLevelIndex))
}

async function getLevels(): Promise<KanjiLevelSummary[]> {
  const indexes = await loadIndexes(availableKanjiLevels())
  const byLevel = new Map(indexes.map((i) => [i.level, i]))
  return KANJI_LEVELS.map((meta) => {
    const index = byLevel.get(meta.id)
    return {
      id: meta.id,
      label: meta.label,
      title: meta.title,
      status: meta.status,
      ...(index && { kanjiCount: index.rows.length, unitCount: index.units.length }),
    }
  })
}

/** Full entry for one kanji from any available level; null if no level has it (yet). */
async function getKanji(char: string): Promise<KanjiEntry | null> {
  // A 404 also lands in the fallback: the API may not serve this kanji's level yet.
  const entry = await loadContent<KanjiEntry | { missing: true }>(
    `/content/kanji/chars/${encodeURIComponent(char)}`,
    async () => (await findKanjiInLevels(char)) ?? { missing: true },
    (d) => 'char' in d && d.char === char,
  )
  return 'missing' in entry ? null : entry
}

async function findKanjiInLevels(char: string): Promise<KanjiEntry | null> {
  const indexes = await loadIndexes(availableKanjiLevels())
  const row = indexes.flatMap((i) => i.rows).find((r) => r.char === char)
  if (!row) return null
  const detail = await getLevelDetail(row.level)
  return detail.entries.find((e) => e.char === char) ?? null
}

function isStrokeData(value: unknown): value is KanjiStrokeData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.strokes) &&
    v.strokes.every((s) => typeof s === 'string') &&
    Array.isArray(v.numbers) &&
    v.numbers.every((n) => Array.isArray(n) && n.length === 2 && n.every((x) => typeof x === 'number'))
  )
}

const strokeCache = new Map<string, Promise<KanjiStrokeData | null>>()

async function loadStrokeFile(url: string): Promise<KanjiStrokeData | null> {
  const data = await fetchStrokeJson(url)
  return isStrokeData(data) ? data : null
}

/** R2 keeps the same layout as the bundled folder: `<base>/kanji/<version>/strokes/<file>.json`. */
async function loadStrokes(char: string): Promise<KanjiStrokeData | null> {
  const file = `${kanjiStrokeFileId(char)}.json`
  const base = getStrokesBaseUrl()
  if (base) {
    const remote = await loadStrokeFile(`${base}/kanji/${KANJI_DATA_VERSION}/strokes/${file}`).catch(() => null)
    if (remote) return remote
  }
  return loadStrokeFile(`/kanji-data/${KANJI_DATA_VERSION}/strokes/${file}`)
}

/**
 * KanjiVG strokes for one kanji, or null when no stroke file exists (yet).
 * Network errors reject (so the UI can offer a retry); a missing or malformed
 * file resolves null. Cached per session.
 */
function getStrokes(char: string): Promise<KanjiStrokeData | null> {
  const hit = strokeCache.get(char)
  if (hit) return hit
  const load = loadStrokes(char)
  strokeCache.set(char, load)
  load.catch(() => strokeCache.delete(char))
  return load
}

const HAN = /\p{Script=Han}/u

/**
 * Search the index of the chosen levels (default: every available level).
 * `query` matches a kanji character (any Han char in it), a kana reading
 * (prefix, katakana/hiragana-insensitive) or an English meaning (word prefix,
 * case-insensitive). An empty query lists everything that passes the filters.
 */
async function search(query: string, filters: KanjiSearchFilters = {}): Promise<KanjiIndexRow[]> {
  const levels = filters.levels?.length ? filters.levels : availableKanjiLevels()
  const indexes = await loadIndexes(levels)
  const rows = indexes.flatMap((i) => i.rows)

  const q = query.trim().toLowerCase()
  const kanaQueries = [q, filters.kanaQuery?.trim() ?? ''].filter(Boolean).map(toHiragana)
  const hanChars = new Set([...q].filter((c) => HAN.test(c)))
  const { min = 0, max = Number.POSITIVE_INFINITY } = filters.strokes ?? {}

  const matches = (row: KanjiIndexRow): boolean => {
    if (row.strokes < min || row.strokes > max) return false
    if (filters.part && !row.parts.includes(filters.part)) return false
    if (!q && kanaQueries.length === 0) return true
    if (hanChars.size > 0) return hanChars.has(row.char)
    if (kanaQueries.some((k) => row.readings.some((r) => toHiragana(r).startsWith(k)))) return true
    return row.meanings.some((m) => m.toLowerCase().split(/[\s;,()-]+/).some((w) => w.startsWith(q)) || m.toLowerCase().startsWith(q))
  }

  const found = rows.filter(matches)
  if (filters.sort === 'strokes') return [...found].sort((a, b) => a.strokes - b.strokes)
  if (filters.sort === 'freq') return [...found].sort((a, b) => (a.freq ?? Infinity) - (b.freq ?? Infinity))
  return found
}

export const kanjiService = {
  getLevels,
  getLevelIndex,
  getLevelDetail,
  getKanji,
  getStrokes,
  search,
}
