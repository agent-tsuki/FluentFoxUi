import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/api/errors'
import { learnService } from '@/api/services/learnService'
import { useAuth } from '@/context/AuthContext'

export type KanjiNoteSave = 'idle' | 'saving' | 'saved' | 'failed'

export interface KanjiNoteState {
  /** The note as last loaded or saved; undefined while loading, for guests, or after a load error. */
  text: string | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
  save: (text: string) => void
  saveState: KanjiNoteSave
}

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

/** No note yet may come back as 404; it reads as an empty note. */
async function loadNote(char: string): Promise<string> {
  try {
    return (await learnService.getKanjiNote(char)).text ?? ''
  } catch (err) {
    if (err instanceof ApiError && err.httpStatus === 404) return ''
    throw err
  }
}

/**
 * The learner's own note for a kanji (GET / PUT /learn/kanji/{char}/note).
 * Only verified learners have notes; guests get nothing and no request.
 */
export function useKanjiNote(char: string): KanjiNoteState {
  const { user } = useAuth()
  const enabled = Boolean(user?.emailVerified)
  const [text, setText] = useState<string | undefined>(undefined)
  const [isLoading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [saveState, setSaveState] = useState<KanjiNoteSave>('idle')
  // Saves finish out of order when typing fast; only the latest one may update the state.
  const saveSeq = useRef(0)

  useEffect(() => {
    setText(undefined)
    setError(null)
    if (!enabled) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    loadNote(char).then(
      (loaded) => {
        if (cancelled) return
        setText(loaded)
        setLoading(false)
      },
      (err: unknown) => {
        if (cancelled) return
        setError(toError(err))
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [char, enabled, attempt])

  const refetch = useCallback(() => setAttempt((a) => a + 1), [])

  const save = useCallback(
    (next: string) => {
      const seq = ++saveSeq.current
      setSaveState('saving')
      learnService.updateKanjiNote(char, next).then(
        (note) => {
          if (seq !== saveSeq.current) return
          setText(note.text ?? next)
          setSaveState('saved')
        },
        () => {
          if (seq === saveSeq.current) setSaveState('failed')
        },
      )
    },
    [char],
  )

  return { text, isLoading, error, refetch, save, saveState }
}
