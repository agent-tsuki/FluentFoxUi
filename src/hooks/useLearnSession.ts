import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { answerQueue } from '@/api/answerQueue'
import { learnService } from '@/api/services/learnService'
import { invalidateLearnSummary } from '@/hooks/useLearnSummary'
import { initialEntries, planRequeue, type AnsweredEntry, type SessionEntry } from '@/lib/learn/sessionPlan'
import type { AnswerRequestItem, AnswerResultItem, LessonItem, SessionResult, SessionStart } from '@/types/learn'

export type LearnSessionPhase = 'starting' | 'start-error' | 'empty' | 'learn' | 'quiz' | 'finishing' | 'finish-error' | 'done'

/** The instant, local ✓/✗ of one shown entry. */
export interface EntryMark {
  given: string
  correct: boolean
}

export interface LearnSession {
  phase: LearnSessionPhase
  error: Error | null
  /** Lessons only: the new items to learn before the check quiz. */
  items: LessonItem[]
  entries: SessionEntry[]
  index: number
  entry: SessionEntry | undefined
  mark: EntryMark | undefined
  result: SessionResult | null
  /** This session's answer results per card id, in the order answered. */
  answersByCard: ReadonlyMap<string, readonly AnswerResultItem[]>
  /** Lesson: done with the learn cards, start the check quiz. */
  startQuiz: () => void
  submit: (answer: AnswerRequestItem, mark: EntryMark) => void
  next: () => void
  /** After 'start-error' or 'finish-error'. */
  retry: () => void
}

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

/**
 * Runs one lesson or review session against the learn API: starts it,
 * shows the lesson's learn cards, then each question once; answers go to the
 * answer queue. When a pass ends, the queue is flushed and cards the server
 * flagged `requeue` are shown again at the end; when none are left the
 * session is completed and its result shown.
 *
 * `start` is called once per mount (StrictMode's second effect run reuses
 * the same request, so no second session is opened).
 */
export function useLearnSession(start: () => Promise<SessionStart>): LearnSession {
  const [phase, setPhase] = useState<LearnSessionPhase>('starting')
  const [error, setError] = useState<Error | null>(null)
  const [started, setStarted] = useState<SessionStart | null>(null)
  const [entries, setEntries] = useState<SessionEntry[]>([])
  const [index, setIndex] = useState(0)
  const [marks, setMarks] = useState<Record<string, EntryMark>>({})
  const [results, setResults] = useState<ReadonlyMap<string, AnswerResultItem>>(new Map())
  const [result, setResult] = useState<SessionResult | null>(null)
  const [attempt, setAttempt] = useState(0)

  const startRef = useRef(start)
  const request = useRef<Promise<SessionStart> | null>(null)
  const entriesRef = useRef(entries)
  // client_event_id → the entry it answered, in answer order.
  const answeredEntries = useRef(new Map<string, SessionEntry>())
  const requeueChecked = useRef(new Set<string>())
  useLayoutEffect(() => {
    startRef.current = start
    entriesRef.current = entries
  })

  const sessionId = started?.session.id

  useEffect(() => {
    let cancelled = false
    request.current ??= startRef.current()
    request.current.then(
      (data) => {
        if (cancelled) return
        const first = initialEntries(data.questions)
        setStarted(data)
        setEntries(first)
        entriesRef.current = first
        if (first.length === 0) setPhase('empty')
        else setPhase(data.items && data.items.length > 0 ? 'learn' : 'quiz')
      },
      (err: unknown) => {
        if (cancelled) return
        request.current = null
        setError(toError(err))
        setPhase('start-error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [attempt])

  useEffect(() => {
    if (!sessionId) return
    return answerQueue.subscribe((event) => {
      if (event.type !== 'results' || event.sessionId !== sessionId) return
      setResults((prev) => {
        const next = new Map(prev)
        for (const r of event.results) next.set(r.client_event_id, r)
        return next
      })
    })
  }, [sessionId])

  const complete = useCallback(async (id: string) => {
    const done = await learnService.completeSession(id)
    invalidateLearnSummary()
    setResult(done)
    setPhase('done')
  }, [])

  const finishPass = useCallback(async () => {
    if (!sessionId) return
    setPhase('finishing')
    try {
      await answerQueue.flush(sessionId)
      const answered: AnsweredEntry[] = []
      for (const [eventId, entry] of answeredEntries.current) {
        const r = answerQueue.getResult(sessionId, eventId)
        if (r) answered.push({ entryKey: entry.key, requeue: r.requeue })
      }
      const more = planRequeue(entriesRef.current, answered, requeueChecked.current)
      answered.forEach((a) => requeueChecked.current.add(a.entryKey))
      if (more.length > 0) {
        setEntries((list) => [...list, ...more])
        setIndex((i) => i + 1)
        setPhase('quiz')
        return
      }
      await complete(sessionId)
    } catch (err) {
      setError(toError(err))
      setPhase('finish-error')
    }
  }, [sessionId, complete])

  const submit = useCallback(
    (answer: AnswerRequestItem, mark: EntryMark) => {
      const entry = entriesRef.current[index]
      if (!sessionId || !entry || answeredEntries.current.has(answer.client_event_id)) return
      answeredEntries.current.set(answer.client_event_id, entry)
      setMarks((m) => ({ ...m, [entry.key]: mark }))
      answerQueue.enqueue(sessionId, answer)
    },
    [sessionId, index],
  )

  const next = useCallback(() => {
    if (index + 1 < entriesRef.current.length) setIndex(index + 1)
    else void finishPass()
  }, [index, finishPass])

  const retry = useCallback(() => {
    setError(null)
    if (phase === 'finish-error') {
      void finishPass()
      return
    }
    setPhase('starting')
    setAttempt((a) => a + 1)
  }, [phase, finishPass])

  const startQuiz = useCallback(() => setPhase('quiz'), [])

  const answersByCard = useMemo(() => {
    const out = new Map<string, AnswerResultItem[]>()
    for (const [eventId, entry] of answeredEntries.current) {
      const r = results.get(eventId)
      if (!r) continue
      const list = out.get(entry.question.card_id) ?? []
      list.push(r)
      out.set(entry.question.card_id, list)
    }
    return out
  }, [results])

  const entry = entries[index]
  return {
    phase,
    error,
    items: started?.items ?? [],
    entries,
    index,
    entry,
    mark: entry ? marks[entry.key] : undefined,
    result,
    answersByCard,
    startQuiz,
    submit,
    next,
    retry,
  }
}
