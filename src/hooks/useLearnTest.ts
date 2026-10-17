import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { learnService } from '@/api/services/learnService'
import { useStudyRecorder, type StudyRecorderControls } from '@/hooks/useStudyRecorder'
import { testOutcome, type TestOutcome } from '@/lib/learn/practiceSession'
import type { SessionStart, StartTestRequest } from '@/types/learn'

export type TestCheck =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'error'; error: Error }
  | { state: 'done'; outcome: TestOutcome }

export interface LearnTest {
  recorder: StudyRecorderControls
  /** The current attempt's session; questions are built from it. */
  session: SessionStart | null
  /** The session could not be started (show an error with `recorder.retry`). */
  startFailed: boolean
  /** A session is being started (first load or a retake): show TestGate. */
  starting: boolean
  /**
   * Call when the last question is answered or time runs out (an effect on
   * the quiz's done flag is fine): it completes the attempt the questions
   * were built for, once.
   */
  submit: (questionCount: number) => void
  /** The server's score once the session is completed. */
  check: TestCheck
  /** After a 'error' check. */
  retryCheck: () => void
  /** A fresh attempt: a new session with new questions. */
  retake: () => void
}

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

/**
 * One test on the learn API (POST /learn/tests): starts the session, lets the
 * page queue answers through `recorder`, then completes it and reads the
 * score the server worked out (`test` in the complete response).
 * `onSession` runs for every new session so the page can build its questions.
 */
export function useLearnTest(request: StartTestRequest, passMark: number, onSession: (session: SessionStart) => void): LearnTest {
  const recorder = useStudyRecorder(() => learnService.startTest(request))
  const [check, setCheck] = useState<TestCheck>({ state: 'idle' })
  // The session the page's questions come from; set in the same render as the page's new questions.
  const [builtFor, setBuiltFor] = useState<string | null>(null)
  const submitted = useRef<string | null>(null)
  const questionCount = useRef(0)
  const onSessionRef = useRef(onSession)
  useLayoutEffect(() => {
    onSessionRef.current = onSession
  })

  const { session, finish, restart } = recorder
  useEffect(() => {
    if (!session) return
    onSessionRef.current(session)
    setBuiltFor(session.session.id)
    setCheck({ state: 'idle' })
  }, [session])

  const runCheck = useCallback(() => {
    setCheck({ state: 'checking' })
    finish().then(
      (result) => {
        const count = questionCount.current
        // Nothing answered (time ran out first): the session was never completed, so every question counts as wrong.
        const outcome = result
          ? testOutcome(result, passMark, count)
          : { kind: request.kind, correct: 0, total: count, score: 0, passed: false }
        setCheck({ state: 'done', outcome })
      },
      (err: unknown) => setCheck({ state: 'error', error: toError(err) }),
    )
  }, [finish, passMark, request.kind])

  const submit = useCallback(
    (count: number) => {
      if (!builtFor || submitted.current === builtFor) return
      submitted.current = builtFor
      questionCount.current = count
      runCheck()
    },
    [builtFor, runCheck],
  )

  const retake = useCallback(() => restart(), [restart])

  return {
    recorder,
    session,
    startFailed: recorder.status === 'start-error',
    starting: recorder.status === 'starting',
    submit,
    check,
    retryCheck: runCheck,
    retake,
  }
}
