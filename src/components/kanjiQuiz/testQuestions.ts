import type { KanjiEntry } from '@/types/kanji'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import type { StudyRecorderControls } from '@/hooks/useStudyRecorder'
import {
  choiceAnswer,
  kanjiQuestionType,
  kanjiQuizKindOf,
  questionChar,
  typedAnswer,
  type KanjiQuizKind,
} from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { buildKanjiQuestion } from './buildKanjiQuestions'
import type { KanjiAnswerMode, KanjiQuestion } from './types'

export interface KanjiTestQuestions {
  questions: KanjiQuestion[]
  /** The server's question (its card) per question key. */
  cards: ReadonlyMap<string, LearnQuestion>
}

/** The kind to show a server question as; an unknown type falls back to its card's facet. */
function kindOf(q: LearnQuestion): { kind: KanjiQuizKind; typed: boolean } {
  return kanjiQuizKindOf(q.question_type) ?? { kind: q.facet === 'reading' ? 'reading' : 'meaning', typed: false }
}

/**
 * A kanji test from a learn API test session: one question per server
 * question (each card), in its order, built locally so the usual options and
 * answer checking apply. `answerMode` overrides typed / choice for meaning
 * and reading questions (the learner's toggle); without it the server's
 * choice is kept. Kanji missing from `byChar` are skipped.
 */
export function kanjiTestQuestions(
  session: SessionStart,
  byChar: ReadonlyMap<string, KanjiEntry>,
  pool: readonly KanjiEntry[],
  answerMode?: KanjiAnswerMode,
): KanjiTestQuestions {
  const cards = new Map<string, LearnQuestion>()
  const questions = session.questions.flatMap((q, i) => {
    const entry = byChar.get(questionChar(q))
    if (!entry) return []
    const { kind, typed } = kindOf(q)
    const key = `${i}-${q.card_id}`
    cards.set(key, q)
    return [buildKanjiQuestion(entry, kind, pool, answerMode ?? (typed ? 'typed' : 'choice'), key)]
  })
  return { questions, cards }
}

/** Queues one test answer on the question's card. */
export function saveKanjiTestAnswer(
  answerCard: StudyRecorderControls['answerCard'],
  cards: ReadonlyMap<string, LearnQuestion>,
  question: KanjiQuestion,
  given: string,
  timer: AnswerTimerControls,
): void {
  const card = cards.get(question.key)
  if (!card) return
  const typed = question.answerKind === 'typed'
  answerCard(card, kanjiQuestionType(question.kind, typed), typed ? typedAnswer(given) : choiceAnswer(given, question.options), timer)
}
