/**
 * Display helpers for the Classes pages. Pure functions, unit-tested.
 */

const HOUR = 3600
const MINUTE = 60

/** Whole-course length: "10h 5m", "2h", "45m", or "" for 0 / unknown (callers hide it). */
export function formatTotalDuration(totalSec: number): string {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return ''
  const hours = Math.floor(totalSec / HOUR)
  // Round to the nearest minute, but never show "0m" for a short course.
  const minutes = Math.max(hours === 0 ? 1 : 0, Math.round((totalSec % HOUR) / MINUTE))
  if (minutes === 60) return `${hours + 1}h`
  if (hours === 0) return `${minutes}m`
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

/** One video's length as a player shows it: "4:05", "1:02:09"; "" for 0 / unknown. */
export function formatVideoDuration(durationSec: number): string {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return ''
  const total = Math.round(durationSec)
  const hours = Math.floor(total / HOUR)
  const minutes = Math.floor((total % HOUR) / MINUTE)
  const seconds = total % MINUTE
  const ss = String(seconds).padStart(2, '0')
  if (hours === 0) return `${minutes}:${ss}`
  return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`
}

/** "660K", "1.2M", "932". Uses English compact notation so it matches the rest of the copy. */
export function formatCompactCount(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

/** "180 videos", "1 video". */
export function formatVideoCount(count: number): string {
  return `${count.toLocaleString('en')} ${count === 1 ? 'video' : 'videos'}`
}

/** "22 Oct 2026", or "" for a missing / invalid timestamp. */
export function formatUpdatedDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i

/**
 * The channel accent colour when it is a safe `#RRGGBB` value, else null. It
 * comes from editors and ends up in a style attribute, so nothing else passes.
 */
export function safeAccentColor(value: string | null | undefined): string | null {
  return value && HEX_COLOR.test(value) ? value : null
}

/** "MS" for "Misa Sensei"; used when a channel has no avatar image. */
export function initials(name: string): string {
  const words = name.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean)
  const letters = words.slice(0, 2).map(w => Array.from(w)[0] ?? '')
  return letters.join('').toUpperCase() || '?'
}
