import type { KanaProgressStore } from '@/api/services/kanaProgressService'
import type { QuizAnswer } from './types'

/**
 * Feeds a finished quiz into spaced repetition: right → 'good', wrong → 'again'.
 * Questions never reached (time ran out) are skipped, since nothing was recalled.
 * Runs one after another so a kana asked twice is scheduled twice, in order.
 */
export async function recordQuizReviews(progress: KanaProgressStore, answers: QuizAnswer[]): Promise<void> {
  for (const a of answers) {
    if (a.chosenId === null) continue
    try {
      await progress.recordReview(a.question.target.id, a.correct ? 'good' : 'again')
    } catch {
      /* progress is best-effort; the quiz result itself is already saved */
    }
  }
}
