import type { KanaChar } from '@/types'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import type { StudyRecorderControls } from '@/hooks/useStudyRecorder'
import { kanaQuizAnswer, questionChar } from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { buildQuestions, type BuildOptions } from './buildQuestions'
import type { QuizQuestion } from './types'

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
