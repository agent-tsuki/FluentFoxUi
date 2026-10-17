import type { KanaChar } from '@/types'

/** Every practice mode receives the same inputs from KanaPracticePage. */
export interface PracticeModeProps {
  /** All playable kana (no empty grid slots), in chart order. */
  kana: KanaChar[]
  /** Called when the learner leaves the mode (e.g. "Back to chart"). */
  onExit: () => void
  /** Call once when a session reaches its results screen (ticks the unit's Practise step). */
  onComplete?: () => void
}

export type PracticeModeId = 'review' | 'listen' | 'build' | 'speed' | 'lookalike' | 'match'
