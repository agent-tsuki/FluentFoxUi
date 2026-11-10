/**
 * Grammar chapters a guest marked complete on this device, per JLPT level
 * (from when chapters had a manual button; new completions come from the test). Storage can be
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
