import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { preloadSpeech } from '@/lib/audio/loadSpeech'

/**
 * Preloads the clips of the texts about to be heard: pass the current and
 * next listening question's text. Each text is fetched once (a tap while it
 * is still loading waits for the same request), and nothing is cancelled when
 * the learner moves on, so a clip already on its way is kept for later.
 */
export function usePreloadSpeech(texts: readonly (string | null | undefined)[]): void {
  const { user } = useAuth()
  const canGenerate = Boolean(user?.emailVerified)
  const key = texts.filter((t): t is string => Boolean(t)).join('\u0000')

  useEffect(() => {
    if (key) preloadSpeech(key.split('\u0000'), canGenerate)
  }, [key, canGenerate])
}
