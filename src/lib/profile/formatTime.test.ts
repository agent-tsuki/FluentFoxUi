import { describe, expect, it } from 'vitest'
import { timeAgo } from '@/lib/profile/formatTime'

const NOW = Date.parse('2026-10-18T12:00:00Z')

describe('timeAgo', () => {
  it.each([
    ['2026-10-18T11:59:30Z', 'just now'],
    ['2026-10-18T11:55:00Z', '5 minutes ago'],
    ['2026-10-18T09:00:00Z', '3 hours ago'],
    ['2026-10-17T12:00:00Z', 'yesterday'],
  ])('formats %s as %s', (iso, want) => {
    expect(timeAgo(iso, NOW)).toBe(want)
  })
})
