import { useCallback, useEffect, useState } from 'react'

/**
 * Speaks Japanese with the browser's built-in voice (Web Speech API).
 * There are no recorded audio files yet; when they exist, play them here and
 * keep speech as the fallback. `supported` is false where no voice exists.
 */
export function useJapaneseSpeech(): { supported: boolean; speak: (text: string) => void } {
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
    (text: string) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.8
      if (voice) utterance.voice = voice
      window.speechSynthesis.speak(utterance)
    },
    [supported, voice],
  )

  return { supported, speak }
}
