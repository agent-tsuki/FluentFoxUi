import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { KanaChar } from '@/types'
import type { QuizAnswer, QuizQuestion } from './types'

interface SessionState {
  questions: QuizQuestion[]
  index: number
  answers: QuizAnswer[]
  done: boolean
}

export interface QuizSession {
  questions: QuizQuestion[]
  index: number
  question: QuizQuestion | undefined
  /** The answer to the current question, once picked. */
  answer: QuizAnswer | undefined
  answers: QuizAnswer[]
  done: boolean
  correctCount: number
  pick: (option: KanaChar) => void
  next: () => void
  /** Time is up: every unanswered question counts as wrong and the quiz ends. */
  expire: () => void
  /** Begin (again) with a fresh set of questions. */
  start: (questions: QuizQuestion[]) => void
}

const fresh = (questions: QuizQuestion[]): SessionState => ({ questions, index: 0, answers: [], done: false })

/**
 * useQuizSession — question-by-question state for a kana quiz. `onFinish`
 * runs exactly once per attempt with every answer (from `next` on the last
 * question, or from `expire`).
 */
export function useQuizSession(initial: () => QuizQuestion[], onFinish: (answers: QuizAnswer[]) => void): QuizSession {
  const [state, setState] = useState<SessionState>(() => fresh(initial()))
  // Read by `expire`, which a timer may call with a stale closure.
  const stateRef = useRef(state)
  const finishRef = useRef(onFinish)
  useLayoutEffect(() => {
    stateRef.current = state
    finishRef.current = onFinish
  })

  const commit = useCallback((next: SessionState) => {
    const wasDone = stateRef.current.done
    stateRef.current = next
    setState(next)
    if (next.done && !wasDone) finishRef.current(next.answers)
  }, [])

  const pick = useCallback(
    (option: KanaChar) => {
      const s = stateRef.current
      const question = s.questions[s.index]
      if (s.done || !question || s.answers.length > s.index) return
      const answer = { question, chosenId: option.id, correct: option.id === question.target.id }
      commit({ ...s, answers: [...s.answers, answer] })
    },
    [commit],
  )

  const next = useCallback(() => {
    const s = stateRef.current
    if (s.done || s.answers.length <= s.index) return
    if (s.index + 1 >= s.questions.length) commit({ ...s, done: true })
    else commit({ ...s, index: s.index + 1 })
  }, [commit])

  const expire = useCallback(() => {
    const s = stateRef.current
    if (s.done) return
    const missing = s.questions.slice(s.answers.length).map((question) => ({ question, chosenId: null, correct: false }))
    commit({ ...s, answers: [...s.answers, ...missing], done: true })
  }, [commit])

  const start = useCallback((questions: QuizQuestion[]) => {
    const next = fresh(questions)
    stateRef.current = next
    setState(next)
  }, [])

  return {
    questions: state.questions,
    index: state.index,
    question: state.questions[state.index],
    answer: state.answers[state.index],
    answers: state.answers,
    done: state.done,
    correctCount: state.answers.filter((a) => a.correct).length,
    pick,
    next,
    expire,
    start,
  }
}
