import { useCallback, useEffect, useState } from 'react'

/** Playback callbacks, e.g. the answer timer's `audioStart` / `audioStop`, so listening time is not counted as answer time. */
export interface SpeechPlaybackHandlers {
  /** The voice started speaking. */
  onStart?: () => void
  /** Speech finished, failed or was cut off by the next `speak`. */
  onEnd?: () => void
}

/**
 * Speaks Japanese with the browser's built-in voice (Web Speech API).
 * There are no recorded audio files yet; when they exist, play them here and
 * keep speech as the fallback. `supported` is false where no voice exists.
 */
export function useJapaneseSpeech(): { supported: boolean; speak: (text: string, handlers?: SpeechPlaybackHandlers) => void } {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    // Voices load asynchronously in Chrome; pick one when the list arrives.
    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      setVoice(voices.find((v) => v.lang === 'ja-JP') ?? voices.find((v) => v.lang.startsWith('ja')) ?? null)
    }
    pick()
    window.speechSynthesis.addEventListener('voiceschanged', pick)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick)
  }, [supported])

  const speak = useCallback(
    (text: string, handlers?: SpeechPlaybackHandlers) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.8
      if (voice) utterance.voice = voice
      if (handlers?.onStart) utterance.onstart = handlers.onStart
      if (handlers?.onEnd) {
        utterance.onend = handlers.onEnd
        utterance.onerror = handlers.onEnd
      }
      window.speechSynthesis.speak(utterance)
    },
    [supported, voice],
  )

  return { supported, speak }
}
