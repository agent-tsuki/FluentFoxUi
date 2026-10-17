/**
 * Pure mapping between the practice / test screens and the learn API
 * (POST /learn/practice, POST /learn/tests, answer payloads). No I/O.
 */
import type { KanaChar } from '@/types'
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import type { KanjiLevelId } from '@/types/kanji'
import type {
  CardFacet,
  LearnQuestion,
  LearningTrack,
  PracticeMode,
  QuestionType,
  SessionResult,
  StartPracticeRequest,
  StartTestRequest,
  TestKind,
} from '@/types/learn'
import { KANJI_TRACK } from './paths'

// ─── Tracks ──────────────────────────────────────────────────────────────────

export function kanaTrack(script: KanaScriptId): LearningTrack {
  return script
}

/** The learn API serves N5 kanji only (v1); other levels have no track yet. */
export function kanjiTrack(level: KanjiLevelId): LearningTrack | null {
  return level === 'n5' ? KANJI_TRACK : null
}

// ─── Practice requests ───────────────────────────────────────────────────────

export type KanaPracticeMode = 'listen' | 'build' | 'speed' | 'lookalike' | 'match'
export type KanjiPracticeMode = 'flashcards' | 'meaning' | 'reading' | 'listening' | 'lookalikes' | 'writing'

/**
 * Modes the API has its own card choice for when practising the whole track.
 * A unit session (`?unit=`) always asks for the unit's cards, so every kana
 * the round can show has a card; the rest practise the weakest cards.
 */
const KANA_API_MODE: Partial<Record<KanaPracticeMode, PracticeMode>> = {
  speed: 'speed',
  lookalike: 'lookalike',
  match: 'match',
}

const KANJI_API_MODE: Partial<Record<KanjiPracticeMode, PracticeMode>> = {
  lookalikes: 'lookalike',
}

function practiceRequest(track: LearningTrack, mode: PracticeMode | undefined, unit?: string): StartPracticeRequest {
  if (unit) return { track, mode: 'unit', unit }
  return { track, mode: mode ?? 'weak' }
}

export function kanaPracticeRequest(script: KanaScriptId, mode: KanaPracticeMode, unit?: string): StartPracticeRequest {
  return practiceRequest(kanaTrack(script), KANA_API_MODE[mode], unit)
}

export function kanjiPracticeRequest(track: LearningTrack, mode: KanjiPracticeMode, unit?: string): StartPracticeRequest {
  return practiceRequest(track, KANJI_API_MODE[mode], unit)
}

// ─── Test requests ───────────────────────────────────────────────────────────

/** The whole track (final test, or a skip test over everything). */
export const ALL_SCOPE = 'all'

export function unitQuizRequest(track: LearningTrack, unit: string): StartTestRequest {
  return { kind: 'unit_quiz', track, scope: unit }
}

/** `scope` is a group id or 'all'. */
export function skipTestRequest(track: LearningTrack, scope: string): StartTestRequest {
  return { kind: 'skip', track, scope }
}

export function finalTestRequest(track: LearningTrack): StartTestRequest {
  return { kind: 'final', track, scope: ALL_SCOPE }
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export function cardKey(char: string, facet: CardFacet): string {
  return `${facet}:${char}`
}

/** The item a question is about (`char`, which older payloads may leave out). */
export function questionChar(q: LearnQuestion): string {
  return q.char ?? q.prompt
}

/**
 * The items a session's questions are about, in the server's order (weakest
 * or most due first), each once.
 */
export function focusChars(questions: readonly LearnQuestion[]): string[] {
  return [...new Set(questions.map(questionChar))]
}

/**
 * Up to `limit` of `ids` in the order of `focus` (the server's choice),
 * leaving out ids not in `ids`. Practice modes ask these first and top up
 * the round at random.
 */
export function prioritise(focus: readonly string[], ids: readonly string[], limit: number): string[] {
  const allowed = new Set(ids)
  return [...new Set(focus)].filter((id) => allowed.has(id)).slice(0, limit)
}

// ─── Answer payloads ─────────────────────────────────────────────────────────

/** What an answer sends besides timing: the picked option or the typed text. */
export interface GivenAnswer {
  chosen_option?: string
  answer_text?: string
  options?: string[]
}

export function choiceAnswer(chosen: string, options: readonly string[]): GivenAnswer {
  return { chosen_option: chosen, options: [...options] }
}

export function typedAnswer(text: string): GivenAnswer {
  return { answer_text: text }
}

/** Kana quiz kinds (QuizRunner) as question types; the server grades by the type sent. */
export type KanaQuizKind = 'read' | 'find' | 'listen'

export const KANA_QUIZ_QUESTION_TYPE: Record<KanaQuizKind, QuestionType> = {
  read: 'kana_mcq_romaji',
  find: 'kana_mcq_kana',
  listen: 'kana_listen',
}

type KanaOption = Pick<KanaChar, 'character' | 'romaji'>

/**
 * A kana quiz answer as the learn API grades it: the romaji for a 'read'
 * question, the kana otherwise. ー and ッ are asked through a loanword, so
 * for them (`mark`) the mark itself stands for a right answer and the picked
 * spelling for a wrong one.
 */
export function kanaQuizAnswer(
  kind: KanaQuizKind,
  picked: KanaOption,
  options: readonly KanaOption[],
  mark?: { char: string; correct: boolean },
): { type: QuestionType; given: GivenAnswer } {
  if (mark) return { type: 'kana_mcq_kana', given: { chosen_option: mark.correct ? mark.char : picked.character } }
  const value = (k: KanaOption) => (kind === 'read' ? k.romaji : k.character)
  return { type: KANA_QUIZ_QUESTION_TYPE[kind], given: choiceAnswer(value(picked), options.map(value)) }
}

/** Kanji quiz kinds (KanjiQuizRunner) as question types. */
export type KanjiQuizKind = 'meaning' | 'reading' | 'kanji' | 'listen'

export function kanjiQuestionType(kind: KanjiQuizKind, typed: boolean): QuestionType {
  switch (kind) {
    case 'meaning':
      return typed ? 'kanji_meaning_typed' : 'kanji_meaning_mcq'
    case 'reading':
      return typed ? 'kanji_reading_typed' : 'kanji_reading_mcq'
    case 'listen':
      return 'kanji_listen'
    case 'kanji':
      return 'kanji_lookalike'
  }
}

/** The card a kanji quiz kind feeds: listening asks for the reading, the rest for the meaning. */
export function kanjiQuizFacet(kind: KanjiQuizKind): CardFacet {
  return kind === 'reading' || kind === 'listen' ? 'reading' : 'meaning'
}

/** How a kanji question from the server is shown: its kind and whether it is typed. */
export function kanjiQuizKindOf(type: QuestionType): { kind: KanjiQuizKind; typed: boolean } | null {
  switch (type) {
    case 'kanji_meaning_mcq':
      return { kind: 'meaning', typed: false }
    case 'kanji_meaning_typed':
      return { kind: 'meaning', typed: true }
    case 'kanji_reading_mcq':
      return { kind: 'reading', typed: false }
    case 'kanji_reading_typed':
      return { kind: 'reading', typed: true }
    case 'kanji_listen':
      return { kind: 'listen', typed: false }
    case 'kanji_lookalike':
      return { kind: 'kanji', typed: false }
    default:
      return null
  }
}

// ─── Test results ────────────────────────────────────────────────────────────

export interface TestOutcome {
  kind: TestKind | null
  correct: number
  total: number
  /** 0–1. */
  score: number
  passed: boolean
}

/**
 * The score of a completed test from the server's result. Without a `test`
 * block (older servers) it falls back to the session's answer counts against
 * `passMark`, over at least `questionCount` questions so unanswered ones
 * count as wrong.
 */
export function testOutcome(result: SessionResult, passMark: number, questionCount = 0): TestOutcome {
  if (result.test) {
    const { kind, score, total, passed } = result.test
    return { kind, correct: score, total, score: total > 0 ? score / total : 0, passed }
  }
  const total = Math.max(result.answer_count, questionCount)
  const score = total > 0 ? result.correct_count / total : 0
  return { kind: null, correct: result.correct_count, total, score, passed: total > 0 && score >= passMark }
}
