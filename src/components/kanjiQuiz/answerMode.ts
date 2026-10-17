import { useCallback, useState } from 'react'
import type { KanjiAnswerMode } from './types'

const KEY = 'ff-kanji-answer-mode-v1'

function read(): KanjiAnswerMode {
  try {
    return localStorage.getItem(KEY) === 'choice' ? 'choice' : 'typed'
  } catch {
    return 'typed'
  }
}

/**
 * The learner's typed ⇄ choice preference for meaning / reading questions,
 * remembered in this browser. Typed is the default (better recall).
 */
export function useKanjiAnswerMode(): [KanjiAnswerMode, (mode: KanjiAnswerMode) => void] {
  const [mode, setModeState] = useState<KanjiAnswerMode>(read)
  const setMode = useCallback((next: KanjiAnswerMode) => {
    setModeState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* blocked: keep it for this page only */
    }
  }, [])
  return [mode, setMode]
}
