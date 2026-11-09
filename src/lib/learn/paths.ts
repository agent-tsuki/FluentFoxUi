import type { LearningTrack } from '@/types/learn'

export const REVIEW_PATH = '/review'
export const HOW_GRADING_WORKS_PATH = '/learn/how-grading-works'

/** The kanji track of v1: N5 only. */
export const KANJI_TRACK: LearningTrack = 'kanji_n5'

export const LEARNING_TRACKS: readonly LearningTrack[] = ['hiragana', 'katakana', 'kanji_n5', 'vocab_n5', 'grammar_n5']

/** Tracks taught by lessons; chapter words and sentences come from their chapter instead. */
export type LessonTrack = 'hiragana' | 'katakana' | 'kanji_n5'
export const LESSON_TRACKS: readonly LessonTrack[] = ['hiragana', 'katakana', 'kanji_n5']

/** The grammar chapter tracks (vocab quiz and exercise). */
export const CHAPTER_VOCAB_TRACK: LearningTrack = 'vocab_n5'
export const CHAPTER_GRAMMAR_TRACK: LearningTrack = 'grammar_n5'

export const TRACK_LABEL: Record<LearningTrack, string> = {
  hiragana: 'Hiragana',
  katakana: 'Katakana',
  kanji_n5: 'N5 kanji',
  vocab_n5: 'N5 vocabulary',
  grammar_n5: 'N5 grammar',
}

export function isLessonTrack(value: string | null | undefined): value is LessonTrack {
  return LESSON_TRACKS.some((t) => t === value)
}

export function isLearningTrack(value: string | null | undefined): value is LearningTrack {
  return LEARNING_TRACKS.some((t) => t === value)
}

/** The lesson runner for one track: new items, then their check quiz. */
export function lessonPath(track: LearningTrack): string {
  return `/learn/lesson/${track}`
}

/** "Review all", or only one track's due cards. */
export function reviewPath(track?: LearningTrack): string {
  return track ? `${REVIEW_PATH}?track=${track}` : REVIEW_PATH
}
