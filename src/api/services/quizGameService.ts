/**
 * Quiz Game Service
 *
 * Returns quiz questions for a given category and JLPT level.
 * Currently uses mock data — to connect a real API, replace the return
 * statements with fetch() calls as noted in each function.
 */

import type { QuizCategory, QuizJlptLevel, QuizQuestionData } from '@/types'
import {
  hiraganaToRomajiQuestions,
  kanjiToMeaningN5,
  kanjiToOnyomiN5,
  allQuizQuestions,
} from '@/api/mock/quizGameData'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Returns a shuffled set of `count` questions for the given category and level.
 *
 * Replace with:
 *   fetch(`/api/quiz/questions?category=${category}&level=${level}&count=${count}`)
 *     .then(r => r.json())
 */
export function getQuizQuestions(
  category: QuizCategory,
  _level: QuizJlptLevel,
  count: number = 10
): QuizQuestionData[] {
  let pool: QuizQuestionData[]

  switch (category) {
    case 'hiragana':
    case 'katakana':
      pool = hiraganaToRomajiQuestions
      break
    case 'kanji':
      pool = [...kanjiToMeaningN5, ...kanjiToOnyomiN5]
      break
    default:
      pool = allQuizQuestions
  }

  return shuffle(pool).slice(0, Math.min(count, pool.length))
}
