import { normaliseMeaning, normaliseReading } from '@/components/kanjiQuiz/markKanjiAnswer'
import { questionView } from '@/lib/learn/questionView'
import type { LearnQuestion } from '@/types/learn'

/**
 * Instant ✓/✗ from the answer the question carries. The server marks the
 * answer again (and is the one that counts); this only drives the feedback.
 * Choices must match exactly. Typed Japanese compares as hiragana (romaji is
 * fine); typed romaji or English compares case- and punctuation-insensitively.
 */
export function markLearnAnswer(question: LearnQuestion, given: string): boolean {
  const accepted = [question.correct_answer, ...(question.accepted_answers ?? [])]
  const view = questionView(question)
  if (view.input === 'choice') return accepted.includes(given)
  const normalise = view.typesKana ? normaliseReading : normaliseMeaning
  const typed = normalise(given)
  return typed !== '' && accepted.some((a) => normalise(a) === typed)
}
