/**
 * Wire shapes of the public `/content/*` API (backend plan §7.1). Kanji
 * payloads are the frontend types the bundled data already uses; the kana
 * payload is groups, units and kana. Each carries `strokes_base_url` (where the
 * stroke JSON lives on R2).
 */
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import type { KanjiEntry, KanjiLevelDetail, KanjiLevelIndex } from '@/types/kanji'

export interface StrokesLocation {
  /** Base URL of the stroke JSON on R2, no trailing slash. Absent → use the bundled files. */
  strokes_base_url?: string
}

export interface KanaContentLookAlike {
  id: string
  char: string
  /** How to tell them apart. */
  note?: string
}

/** One kana as `GET /content/kana/{script}` sends it, in path order. */
export interface KanaContentChar {
  /** Chart id, the same in both scripts (e.g. `shi`). */
  id: string
  character: string
  romaji: string
  /** basic | dakuten | compound | foreign; the chart section it belongs to. */
  type: string
  isCompound?: boolean
  /** Other accepted spellings (si, tu, hu, zi …). */
  altRomaji: string[]
  groupId: string
  unitId: string
  position: number
  strokeCount?: number
  lookAlikes: KanaContentLookAlike[]
}

export interface KanaContentUnit {
  id: string
  title: string
  summary: string
  kanaIds: string[]
  youtubeId?: string
  videoCredit?: string
}

export interface KanaContentGroup {
  id: string
  title: string
  summary: string
  unitIds: string[]
}

/**
 * GET /content/kana/{script}: groups, units and kana. The chart grid is built
 * from `kana` on the client (lib/content/kana/buildKanaSections).
 */
export interface KanaContentData extends StrokesLocation {
  script: KanaScriptId
  groups: KanaContentGroup[]
  units: KanaContentUnit[]
  kana: KanaContentChar[]
}

/** GET /content/kanji/{level}/index */
export type KanjiIndexContentData = KanjiLevelIndex & StrokesLocation

/** GET /content/kanji/{level}/detail */
export type KanjiDetailContentData = KanjiLevelDetail & StrokesLocation

/** GET /content/kanji/chars/{char} */
export type KanjiEntryContentData = KanjiEntry & StrokesLocation
