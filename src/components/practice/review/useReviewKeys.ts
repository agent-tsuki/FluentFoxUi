import { useEffect } from 'react'
import type { KanaGrade } from '@/types/kanaProgress'

const GRADE_KEYS: Record<string, KanaGrade> = {
  ArrowLeft: 'again',
  ArrowRight: 'good',
  '1': 'again',
  '2': 'hard',
  '3': 'good',
  '4': 'easy',
}

interface ReviewKeysOptions {
  enabled: boolean
  revealed: boolean
  onReveal: () => void
  onGrade: (grade: KanaGrade) => void
}

/** Space reveals; ←/→ and 1–4 grade once revealed. Ignores typing and modifier combos. */
export function useReviewKeys({ enabled, revealed, onReveal, onGrade }: ReviewKeysOptions) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

      if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
        // Enter on a focused button already clicks it; only take over Space/Enter elsewhere.
        if (event.key === 'Enter' && target?.closest('button')) return
        event.preventDefault()
        onReveal()
        return
      }
      const grade = GRADE_KEYS[event.key]
      if (revealed && grade) {
        event.preventDefault()
        onGrade(grade)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, revealed, onReveal, onGrade])
}
