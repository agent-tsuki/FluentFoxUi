/**
 * Kanji course domain types. These are also the wire shapes of the kanji API:
 * N5 and N4 are served from bundled JSON today, N3–N1 will come from the
 * backend later in exactly these shapes (see src/api/services/kanjiService.ts),
 * so no UI changes when a level moves to the API.
 *
 * Reading conventions (all data, every level):
 * - on'yomi are katakana (ニチ), kun'yomi are hiragana (ひ).
 * - Vocab readings are hiragana (にほん).
 * - Compare readings only after katakana → hiragana normalisation
 *   (`toHiragana` in src/lib/content/kanji/kanjiText.ts).
 */

// ─── Levels ───────────────────────────────────────────────────────────────────

/** JLPT level ids, used in URLs (`/kanji/n5`) and data. */
export type KanjiLevelId = 'n5' | 'n4' | 'n3' | 'n2' | 'n1'

/**
 * available   — the level has course data (bundled today, API later).
 * coming-soon — shown as a placeholder (switcher, Browse filter); no data, no fake counts.
 */
export type KanjiLevelStatus = 'available' | 'coming-soon'

/** One level as `kanjiService.getLevels()` returns it. */
export interface KanjiLevelSummary {
  id: KanjiLevelId
  /** "N5" */
  label: string
  /** "N5 Kanji" */
  title: string
  status: KanjiLevelStatus
  /** Derived from the level index; absent for coming-soon levels. */
  kanjiCount?: number
  unitCount?: number
}

// ─── Units & groups (part of the level index payload) ────────────────────────

/** One short unit of a level's guided path (6 kanji at N5, 8 at N4). */
export interface KanjiUnit {
  /** Stable id, unique within the level, e.g. 'u01'. */
  id: string
  /** Short title shown on rows and cards, e.g. "Sun & moon". */
  title: string
  /** One-line summary. */
  summary: string
  /** The kanji taught in this unit, in teaching order (component-first). */
  kanji: string[]
  /** Parts this unit uses for the first time in the level (the "New part" callout). */
  newParts?: string[]
}

/** A themed group of units, e.g. "Numbers & time". Ids are unique within a level. */
export interface KanjiGroup {
  id: string
  title: string
  summary: string
  /** Unit ids in path order. */
  unitIds: string[]
}

// ─── Index (light: Course hub, Browse, search) ────────────────────────────────

/** One kanji in a level index. Enough for tiles, rows, search and sorting. */
export interface KanjiIndexRow {
  char: string
  level: KanjiLevelId
  unitId: string
  /** Primary English meaning, e.g. "day". */
  meaning: string
  /** Every English meaning, then the synonyms (search + Browse), primary first. */
  meanings: string[]
  /** The key reading's kana (as in `KanjiEntry.keyReading.kana`). */
  keyReading: string
  /** Every reading for search: on'yomi (katakana) + kun'yomi stems (hiragana). */
  readings: string[]
  /** Part characters, for Browse part search. */
  parts: string[]
  strokes: number
  /** Newspaper frequency rank (1 = most common); absent if unranked. */
  freq?: number
}

/** `kanjiService.getLevelIndex(level)` payload. */
export interface KanjiLevelIndex {
  level: KanjiLevelId
  /** The guided path, in order. */
  units: KanjiUnit[]
  groups: KanjiGroup[]
  /** Every kanji of the level, in course order. */
  rows: KanjiIndexRow[]
}

// ─── Full entries (kanji page, lessons, quizzes) ─────────────────────────────

/** A kun'yomi with its okurigana split out: た + べる → "た(べる)". */
export interface KanjiKunReading {
  /** The part the kanji itself reads, hiragana: 'た'. */
  kana: string
  /** Trailing kana written after the kanji: 'べる'. */
  okurigana?: string
  /** 'suffix' for forms like -び (日), 'prefix' for こ- (木). */
  affix?: 'prefix' | 'suffix'
}

/** The one reading a lesson teaches first, with the word that carries it. */
export interface KanjiKeyReading {
  type: 'on' | 'kun'
  /** Katakana for on, hiragana stem for kun (must be one of the entry's readings). */
  kana: string
}

export interface KanjiVocab {
  word: string
  /** Hiragana. */
  reading: string
  meaning: string
  /** The key word: it carries `keyReading`. Exactly one per entry. */
  isKey?: boolean
}

/** A component (radical / part) of a kanji. */
export interface KanjiPart {
  char: string
  /** English name, e.g. "person". */
  name: string
}

export interface KanjiMnemonic {
  text: string
  /** True until the owner / a native reviewer has edited it. */
  draft: boolean
}

export interface KanjiLookAlike {
  char: string
  /** One-line difference, e.g. "目 eye has two inner bars". */
  note?: string
}

export interface KanjiEntry {
  char: string
  /** The JLPT level this kanji belongs to. */
  jlpt: KanjiLevelId
  /** Unit within its level. */
  unitId: string
  /** English meanings, most important first. */
  meanings: string[]
  /** Katakana. */
  on: string[]
  kun: KanjiKunReading[]
  keyReading: KanjiKeyReading
  /** One short tip, e.g. "Alone it's ひ; in compounds usually ニチ." */
  readingTip?: string
  parts: KanjiPart[]
  /** 3–6 words, key word first. */
  vocab: KanjiVocab[]
  /** Japanese school grade (1–6, 8 = secondary). */
  grade?: number
  freq?: number
  strokes: number
  /** Absent → the page hides the mnemonic block (the personal note always shows). */
  mnemonic?: KanjiMnemonic
  /** Extra accepted English answers (meaning cards). */
  synonyms?: string[]
  lookAlikes?: KanjiLookAlike[]
}

/** `kanjiService.getLevelDetail(level)` payload. */
export interface KanjiLevelDetail {
  level: KanjiLevelId
  /** Every entry of the level, in course order. */
  entries: KanjiEntry[]
}

// ─── Strokes ─────────────────────────────────────────────────────────────────

/** A KanjiVG `kvg:element` group: strokes [from, to) form one part. */
export interface KanjiStrokeGroup {
  element: string
  from: number
  to: number
}

/**
 * KanjiVG stroke data for one kanji (109×109 cell). Same `strokes` /
 * `numbers` shape as the kana stroke JSON, so StrokeOrder / TracePad / PDFs
 * can share code.
 */
export interface KanjiStrokeData {
  /** SVG path `d` per stroke, in stroke order (commands MmCcSsLl only). */
  strokes: string[]
  /** Stroke-number label positions [x, y], one per stroke. */
  numbers: [number, number][]
  groups?: KanjiStrokeGroup[]
}

// ─── Search ──────────────────────────────────────────────────────────────────

export type KanjiSort = 'course' | 'strokes' | 'freq'

export interface KanjiSearchFilters {
  /** Levels to search; default = every available level. Coming-soon levels are skipped. */
  levels?: KanjiLevelId[]
  /** Inclusive stroke range. */
  strokes?: { min?: number; max?: number }
  /** Only kanji containing this part character. */
  part?: string
  /**
   * The query converted from romaji to kana by the caller (wanakana lives in
   * the UI chunk, not the service). Matched against readings alongside `query`.
   */
  kanaQuery?: string
  sort?: KanjiSort
}

// ─── SRS ─────────────────────────────────────────────────────────────────────

/** Each kanji has two review cards: `日:m` (meaning) and `日:r` (reading). */
export type KanjiCardFace = 'meaning' | 'reading'
