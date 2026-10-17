import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { KanjiAnswer, KanjiQuestion } from './types'
import { markKanjiAnswer } from './markKanjiAnswer'

interface SessionState {
  questions: KanjiQuestion[]
  index: number
  answers: KanjiAnswer[]
  done: boolean
}

export interface KanjiQuizSession {
  questions: KanjiQuestion[]
  index: number
  question: KanjiQuestion | undefined
  /** The answer to the current question, once given. */
  answer: KanjiAnswer | undefined
  answers: KanjiAnswer[]
  done: boolean
  correctCount: number
  /** Choose an option or submit typed text. */
  submit: (given: string) => void
  next: () => void
  /** Time is up: every unanswered question counts as wrong and the quiz ends. */
  expire: () => void
  /** Begin (again) with fresh questions. */
  start: (questions: KanjiQuestion[]) => void
  /** Swap the questions still ahead (e.g. after switching typed ⇄ choice). */
  replaceUpcoming: (rebuild: (q: KanjiQuestion) => KanjiQuestion) => void
}

const fresh = (questions: KanjiQuestion[]): SessionState => ({ questions, index: 0, answers: [], done: false })

/**
 * useKanjiQuizSession — question-by-question state for any kanji quiz (unit
 * quiz, reviews, test-outs, level test, practice). The kanji counterpart of
 * the kana useQuizSession. `onFinish` runs once per attempt with every answer.
 */
export function useKanjiQuizSession(initial: () => KanjiQuestion[], onFinish: (answers: KanjiAnswer[]) => void): KanjiQuizSession {
  const [state, setState] = useState<SessionState>(() => fresh(initial()))
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

  const submit = useCallback(
    (given: string) => {
      const s = stateRef.current
      const question = s.questions[s.index]
      if (s.done || !question || s.answers.length > s.index) return
      commit({ ...s, answers: [...s.answers, markKanjiAnswer(question, given)] })
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
    const missing = s.questions.slice(s.answers.length).map((question) => ({ question, given: null, correct: false }))
    commit({ ...s, answers: [...s.answers, ...missing], done: true })
  }, [commit])

  const start = useCallback((questions: KanjiQuestion[]) => {
    const next = fresh(questions)
    stateRef.current = next
    setState(next)
  }, [])

  const replaceUpcoming = useCallback((rebuild: (q: KanjiQuestion) => KanjiQuestion) => {
    const s = stateRef.current
    const firstOpen = s.answers.length
    const questions = s.questions.map((q, i) => (i >= firstOpen ? rebuild(q) : q))
    const next = { ...s, questions }
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
    submit,
    next,
    expire,
    start,
    replaceUpcoming,
  }
}
