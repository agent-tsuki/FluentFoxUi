import { useState } from 'react'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { SessionDialog } from './SessionDialog'
import { UnitQuiz } from './UnitQuiz'

interface UnitQuizDialogProps {
  /** The unit being quizzed; null closes the popup. */
  unit: KanaUnit | null
  all: KanaChar[]
  onClose: () => void
}

/**
 * The unit quiz as a popup over the Learn page. While questions are being
 * answered it can't be closed by clicking outside or Escape, only through the
 * quiz's own ✕, which asks first and scores the attempt.
 */
export function UnitQuizDialog({ unit, all, onClose }: UnitQuizDialogProps) {
  const [running, setRunning] = useState(false)
  return (
    <SessionDialog open={unit !== null} label={unit ? `${unit.title} quiz` : 'Quiz'} onClose={onClose} dismissable={!running}>
      {unit && <UnitQuiz key={unit.id} unit={unit} all={all} onExit={onClose} onRunningChange={setRunning} />}
    </SessionDialog>
  )
}
