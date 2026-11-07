/**
 * What to tell a learner who pressed Review when there is nothing to review or
 * the review check failed, instead of opening an empty or broken session.
 * Pure: the caller fetches the summary and shows the result as a toast.
 */
import { ApiError } from '@/api/errors'
import type { LearnSummary, LearningTrack } from '@/types/learn'
import { TRACK_LABEL, lessonPath } from '@/lib/learn/paths'

export interface ReviewNoticeAction {
  label: string
  to: string
}

export interface ReviewNotice {
  tone: 'info' | 'error'
  title: string
  message: string
  actions: ReviewNoticeAction[]
}

/** Other courses to try while nothing is due. */
const COURSE_ACTIONS: readonly ReviewNoticeAction[] = [
  { label: 'Kana', to: '/kana/hiragana/learn' },
  { label: 'Kanji', to: '/kanji/n5' },
  { label: 'Grammar', to: '/grammar/n5/1' },
]

const HTTP_TOO_MANY = 429
const HTTP_SERVER_ERROR = 500
const HTTP_UNAUTHORIZED = 401
const HTTP_FORBIDDEN = 403
const HTTP_NOT_FOUND = 404

/** Null when the learner has reviews due now (go to the session). */
export function noReviewsNotice(summary: LearnSummary, track?: LearningTrack): ReviewNotice | null {
  if (summary.due_now > 0) return null
  const later = summary.due_today - summary.due_now
  const scope = track ? `${TRACK_LABEL[track]} reviews` : 'reviews'
  return {
    tone: 'info',
    title: `No ${scope} due right now`,
    message:
      later > 0
        ? `You're caught up for now; ${later} more come due later today. Meanwhile, learn something new.`
        : "You're all caught up. Cards come back for review as you learn them, so try a new lesson or another course.",
    actions: track ? [{ label: `Learn ${TRACK_LABEL[track]}`, to: lessonPath(track) }, ...COURSE_ACTIONS] : [...COURSE_ACTIONS],
  }
}

/** A failed review check, worded by HTTP status (shown with the code so support can match it). */
export function reviewErrorNotice(error: unknown): ReviewNotice {
  const status = error instanceof ApiError ? error.httpStatus : null
  const notice = (title: string, message: string): ReviewNotice => ({ tone: 'error', title, message, actions: [...COURSE_ACTIONS] })
  if (status === 0) return notice("Can't reach FoxSensei", 'Check your internet connection, then try Review again.')
  if (status === HTTP_UNAUTHORIZED || status === HTTP_FORBIDDEN) {
    return notice(`Review isn't available (${status})`, 'Please sign in again to review your cards.')
  }
  if (status === HTTP_NOT_FOUND) return notice('Review not available (404)', "Reviews couldn't be found for your account. Try a course in the meantime.")
  if (status === HTTP_TOO_MANY) return notice('Too many requests (429)', 'Wait a few seconds, then try Review again.')
  if (status !== null && status >= HTTP_SERVER_ERROR) {
    return notice(`Review is unavailable right now (${status})`, 'Our server hit a problem. Please try again in a minute, or keep learning in a course.')
  }
  if (status !== null) return notice(`Review couldn't start (${status})`, 'Something went wrong with this request. Please try again.')
  return notice("Review couldn't start", 'Something went wrong. Please try again.')
}
