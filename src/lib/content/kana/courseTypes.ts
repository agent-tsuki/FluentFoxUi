/**
 * Shared shapes for a kana course (hiragana, katakana). Each script provides
 * its own units and groups in these shapes; the course engine is script-agnostic.
 */

/** The groups a course's units are organised into. 'foreign' is katakana-only. */
export type KanaGroupId = 'basic' | 'dakuten' | 'combo' | 'foreign'

/** What a skip ("test out") test covers: one group, or the whole course. */
export type KanaSkipScope = KanaGroupId | 'all'

export interface KanaUnit {
  id: string
  /** Short title shown on rows and cards, e.g. "か row" / "カ row". */
  title: string
  /** One-line summary. */
  summary: string
  /** Kana ids (from the script's kana list) taught in this unit, in order. */
  kanaIds: string[]
  youtubeId?: string
  videoCredit?: string
}

export interface KanaGroup {
  id: KanaGroupId
  title: string
  summary: string
  unitIds: string[]
}
