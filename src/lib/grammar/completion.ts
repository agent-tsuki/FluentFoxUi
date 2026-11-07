/**
 * Grammar chapters the learner marked complete, per JLPT level. Kept on this
 * device (localStorage) until grammar progress has an API. Storage can be
 * blocked or hold junk, so reads never throw.
 */

const key = (level: string) => `ff-complete-${level.toLowerCase()}`

export function readCompletedChapters(level: string): Set<number> {
  try {
    const raw = localStorage.getItem(key(level))
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((n): n is number => Number.isInteger(n)) : [])
  } catch {
    return new Set()
  }
}

export function writeCompletedChapters(level: string, chapters: ReadonlySet<number>): void {
  try {
    localStorage.setItem(key(level), JSON.stringify([...chapters]))
  } catch {
    /* storage blocked: progress lasts for this visit only */
  }
}
