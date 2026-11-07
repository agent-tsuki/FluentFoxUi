import type { KanaChar } from '@/types'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import type { StudyRecorderControls } from '@/hooks/useStudyRecorder'
import { kanaQuizAnswer, questionChar } from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { buildQuestions, buildQuestionsAs, type BuildOptions } from './buildQuestions'
import type { QuestionKind, QuizQuestion } from './types'

export interface KanaTestQuestions {
  questions: QuizQuestion[]
  /** The server's question (its card) per kana id. */
  cards: ReadonlyMap<string, LearnQuestion>
}

/**
 * A kana test from a learn API test session: one question per kana the
 * server asks, in its order, shown as the usual read / find / listen
 * questions (see buildQuestions). Kana the chart does not have are skipped;
 * the server counts them as unanswered.
 */
export function kanaTestQuestions(session: SessionStart, all: KanaChar[], options: BuildOptions): KanaTestQuestions {
  const byChar = new Map(all.map((k) => [k.character, k]))
  const cards = new Map<string, LearnQuestion>()
  const targets: KanaChar[] = []
  for (const q of session.questions) {
    const kana = byChar.get(questionChar(q))
    if (!kana || cards.has(kana.id)) continue
    cards.set(kana.id, q)
    targets.push(kana)
  }
  return { questions: buildQuestions(targets, all, options), cards }
}

/** The server's multiple-choice question types as quiz kinds. */
const KIND_OF_TYPE: Partial<Record<LearnQuestion['question_type'], QuestionKind>> = {
  kana_mcq_romaji: 'read',
  kana_mcq_kana: 'find',
}

/**
 * A kana unit quiz from a learn API session: every question the server asks,
 * in its order and the way round it says (see the API's kanaQuizPlan: each
 * kana up to four times, twice kana → romaji and twice romaji → kana). The
 * server scores every answer, so nothing is merged; repeats share their card.
 */
export function kanaUnitQuizQuestions(session: SessionStart, all: KanaChar[], options: BuildOptions): KanaTestQuestions {
  const byChar = new Map(all.map((k) => [k.character, k]))
  const cards = new Map<string, LearnQuestion>()
  const asks: { target: KanaChar; kind: QuestionKind }[] = []
  for (const q of session.questions) {
    const kana = byChar.get(questionChar(q))
    if (!kana) continue
    cards.set(kana.id, q)
    asks.push({ target: kana, kind: KIND_OF_TYPE[q.question_type] ?? 'read' })
  }
  return { questions: buildQuestionsAs(asks, all, options), cards }
}

/** Queues one test answer on the question's card. */
export function saveKanaTestAnswer(
  answerCard: StudyRecorderControls['answerCard'],
  cards: ReadonlyMap<string, LearnQuestion>,
  question: QuizQuestion,
  picked: KanaChar,
  timer: AnswerTimerControls,
): void {
  const card = cards.get(question.target.id)
  if (!card) return
  const char = questionChar(card)
  // ー and ッ questions show a loanword, so their target's character is the word.
  const mark = question.target.character === char ? undefined : { char, correct: picked.id === question.target.id }
  const { type, given } = kanaQuizAnswer(question.kind, picked, question.options, mark)
  answerCard(card, type, given, timer)
}
