/**
 * Course-agnostic practice item (types only). Phase 1: Agent B moves
 * SwipeReview, ListenTap, KanaMatch → Match, SpeedRound and LookAlikeDrill
 * onto `PracticeItem[]` through adapters (`kanaToItem`,
 * `kanjiToItem(entry, face)`). WordBuilder stays kana-only.
 */

/** What a kanji practice card asks for. */
export type KanjiPracticeFace = 'meaning' | 'reading'

export interface PracticeItem {
  /** Stable id: kana id ('ka') or a kanji card id ('日:m' / '日:r'). */
  id: string
  /** What the learner sees: 'か', '日'. */
  face: string
  /** The expected answer: 'ka', 'day', 'にち'. */
  answer: string
  /** Other accepted answers (synonyms, other readings). */
  alsoAccepted?: string[]
  /** Small line under the answer, e.g. the key word "毎日 まいにち". */
  detail?: string
  /** Text for TTS; absent → no speaker button / listen mode skips the item. */
  speech?: string
  /** Faces that look like this one (look-alike drill + distractors). */
  lookAlikes?: string[]
  /** FSRS / progress id the item records against, if it differs from `id`. */
  progressId?: string
  /** Unit the item belongs to (unit-scoped practice). */
  unitId?: string
}

/** Builds a PracticeItem from a course's own item type. */
export type PracticeItemAdapter<T> = (item: T) => PracticeItem

/** Props of an item-based practice mode (the generic successor of PracticeModeProps). */
export interface PracticeItemModeProps {
  items: PracticeItem[]
  onExit: () => void
  /** Call once when a session reaches its results screen. */
  onComplete?: () => void
}
