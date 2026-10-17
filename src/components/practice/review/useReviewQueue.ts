import { useCallback, useMemo, useRef, useState } from 'react'
import type { KanaChar } from '@/types'
import type { KanaGrade } from '@/types/kanaProgress'
import type { KanaProgressStore } from '@/api/services/kanaProgressService'

/** An "Again" card returns this many cards later (or at the end if sooner). */
const REQUEUE_GAP = 3

interface QueueEntry {
  kana: KanaChar
  /** True for the one extra showing of a card graded "Again". */
  repeat: boolean
}

interface ReviewQueue {
  current: QueueEntry | undefined
  /** 0-based position in the (growing) queue. */
  position: number
  length: number
  done: boolean
  busy: boolean
  /** Unique cards seen, and how many were known on first try. */
  total: number
  known: number
  missed: KanaChar[]
  grade: (grade: KanaGrade) => Promise<void>
  restart: (cards: KanaChar[]) => void
}

/**
 * Card queue for one swipe-review session. Each grade is saved to FSRS before
 * moving on; a card graded "Again" is shown once more later in the session.
 */
export function useReviewQueue(progress: KanaProgressStore): ReviewQueue {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [position, setPosition] = useState(0)
  const [firstGrades, setFirstGrades] = useState<Map<string, { kana: KanaChar; grade: KanaGrade }>>(new Map())
  const [busy, setBusy] = useState(false)
  // A ref as well as state so a fast double-swipe can't grade the same card twice.
  const busyRef = useRef(false)

  const current = queue[position]

  const grade = useCallback(
    async (value: KanaGrade) => {
      if (!current || busyRef.current) return
      busyRef.current = true
      setBusy(true)
      try {
        await progress.recordReview(current.kana.id, value)
      } catch {
        /* storage/scheduler failure: keep the session going; this grade is just not saved */
      }
      setFirstGrades((prev) =>
        prev.has(current.kana.id) ? prev : new Map(prev).set(current.kana.id, { kana: current.kana, grade: value }),
      )
      if (value === 'again' && !current.repeat) {
        setQueue((prev) => {
          const next = [...prev]
          next.splice(Math.min(position + 1 + REQUEUE_GAP, next.length), 0, { kana: current.kana, repeat: true })
          return next
        })
      }
      setPosition((p) => p + 1)
      busyRef.current = false
      setBusy(false)
    },
    [current, position, progress],
  )

  const restart = useCallback((cards: KanaChar[]) => {
    setQueue(cards.map((kana) => ({ kana, repeat: false })))
    setPosition(0)
    setFirstGrades(new Map())
  }, [])

  const summary = useMemo(() => {
    const entries = [...firstGrades.values()]
    return {
      total: entries.length,
      known: entries.filter((e) => e.grade !== 'again').length,
      missed: entries.filter((e) => e.grade === 'again').map((e) => e.kana),
    }
  }, [firstGrades])

  return {
    current,
    position,
    length: queue.length,
    done: queue.length > 0 && position >= queue.length,
    busy,
    ...summary,
    grade,
    restart,
  }
}
