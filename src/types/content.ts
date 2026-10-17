/**
 * Wire shapes of the public `/content/*` API (backend plan §7.1). Each payload
 * is the frontend type the bundled data already uses, plus `strokes_base_url`
 * (where the stroke JSON lives on R2).
 */
import type { KanaSection } from '@/types'
import type { KanaGroup, KanaUnit } from '@/lib/content/kana/courseTypes'
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import type { KanjiEntry, KanjiLevelDetail, KanjiLevelIndex } from '@/types/kanji'

export interface StrokesLocation {
  /** Base URL of the stroke JSON on R2, no trailing slash. Absent → use the bundled files. */
  strokes_base_url?: string
}

/** GET /content/kana/{script} */
export interface KanaContentData extends StrokesLocation {
  script: KanaScriptId
  /** The chart sections (spacers included), in order. */
  sections: KanaSection[]
  units?: KanaUnit[]
  groups?: KanaGroup[]
}

/** GET /content/kanji/{level}/index */
export type KanjiIndexContentData = KanjiLevelIndex & StrokesLocation

/** GET /content/kanji/{level}/detail */
export type KanjiDetailContentData = KanjiLevelDetail & StrokesLocation

/** GET /content/kanji/chars/{char} */
export type KanjiEntryContentData = KanjiEntry & StrokesLocation
