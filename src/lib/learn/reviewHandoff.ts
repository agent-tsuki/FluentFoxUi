/**
 * Hands a review session that the Review button already started over to the
 * /review page, so the page opens straight into it without a second
 * POST /learn/reviews. One slot: the newest start wins. `peek` does not clear
 * (React StrictMode renders twice in dev); the page clears it after mounting.
 */
import type { LearningTrack, SessionStart } from '@/types/learn'

let slot: { track: LearningTrack | undefined; start: SessionStart } | null = null

export function stashReviewStart(track: LearningTrack | undefined, start: SessionStart): void {
  slot = { track, start }
}

/** The stashed session for this track, if the Review button just started one. */
export function peekReviewStart(track: LearningTrack | undefined): SessionStart | undefined {
  return slot && slot.track === track ? slot.start : undefined
}

export function clearReviewStart(): void {
  slot = null
}
