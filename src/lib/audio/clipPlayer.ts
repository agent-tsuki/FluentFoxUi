/**
 * Plays recorded clips one after another on a single shared <audio> element,
 * so starting new speech always stops the previous one.
 */

/** A silent WAV played inside the tap that starts speech: iOS only lets an
 * <audio> element play later (after the clips load) once it has played during
 * a user gesture. */
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='

let element: HTMLAudioElement | null = null
let stopCurrent: (() => void) | null = null
/** The playing clips: which one, of how many. */
let playing: { index: number; count: number } | null = null
/** Set once the element has played: from then on it may play without a tap. */
let unlocked = false

function audioElement(): HTMLAudioElement {
  element ??= new Audio()
  return element
}

/**
 * Call synchronously in a click/tap handler, before any await. Outside a tap
 * (a quiz playing its question by itself) the browser may refuse; the
 * element then stays locked and the next tap tries again.
 */
export function unlockClipPlayback(): void {
  if (unlocked || stopCurrent) return
  const audio = audioElement()
  audio.src = SILENT_WAV
  audio.play().then(
    () => {
      unlocked = true
    },
    () => {},
  )
}

const GESTURES = ['click', 'touchend', 'keydown'] as const
let listening = false

/**
 * Unlocks playback on the learner's next tap or key press anywhere on the
 * page, so speech that starts by itself later (a listening question after the
 * previous answer) can play on Safari too.
 */
export function unlockOnNextGesture(): void {
  if (unlocked || listening || typeof window === 'undefined') return
  listening = true
  const onGesture = () => {
    unlockClipPlayback()
    if (!unlocked && !stopCurrent) return
    GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true))
    listening = false
  }
  GESTURES.forEach((g) => window.addEventListener(g, onGesture, true))
}

export function stopClips(): void {
  stopCurrent?.()
  stopCurrent = null
}

/** How far playback is: clip `part` of `parts` (one per sentence), `fraction` of the way through it. */
export interface PlaybackProgress {
  part: number
  parts: number
  fraction: number
}

/** Where the clips now playing are, or null when none are (for highlighting the words as they are said). */
export function clipProgress(): PlaybackProgress | null {
  if (!playing || !element) return null
  const { duration, currentTime } = element
  const fraction = Number.isFinite(duration) && duration > 0 ? Math.min(1, currentTime / duration) : 0
  return { part: playing.index, parts: playing.count, fraction }
}

export interface ClipPlayback {
  onStart?: () => void
  /** Called once: finished, failed or stopped. */
  onEnd?: () => void
}

/** Plays the clips in order; resolves false if playback could not start (e.g. autoplay blocked). */
export function playClips(clips: Blob[], { onStart, onEnd }: ClipPlayback = {}): Promise<boolean> {
  stopClips()
  const audio = audioElement()
  const urls = clips.map((clip) => URL.createObjectURL(clip))
  let index = 0
  let ended = false
  let started = false

  return new Promise<boolean>((resolve) => {
    const finish = (ok: boolean) => {
      if (ended) return
      ended = true
      audio.onended = null
      audio.onerror = null
      audio.pause()
      urls.forEach((url) => URL.revokeObjectURL(url))
      if (stopCurrent === stop) {
        stopCurrent = null
        playing = null
      }
      if (started) onEnd?.()
      resolve(ok || started)
    }
    const stop = () => finish(true)
    stopCurrent = stop

    const playAt = (i: number) => {
      playing = { index: i, count: urls.length }
      audio.src = urls[i]
      audio.play().then(
        () => {
          unlocked = true
          if (!started) {
            started = true
            onStart?.()
          }
        },
        () => finish(false),
      )
    }
    audio.onended = () => {
      index += 1
      if (index < urls.length) playAt(index)
      else finish(true)
    }
    audio.onerror = () => finish(false)
    playAt(0)
  })
}
