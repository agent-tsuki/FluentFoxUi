import { describe, expect, it } from 'vitest'
import type { TutorialState } from '@/types/tutorial'
import { effectiveStatus, parseLocalRecord, shouldShow } from './tutorialState'

const server = (over: Partial<TutorialState> = {}): TutorialState => ({
  key: 'welcome', status: 'pending', version: 1, lastStep: null, completedAt: null, updatedAt: null, ...over,
})

describe('parseLocalRecord', () => {
  it('reads a valid record', () => {
    expect(parseLocalRecord('{"status":"skipped","version":1,"lastStep":2,"synced":false}')).toEqual({ status: 'skipped', version: 1, lastStep: 2, synced: false })
  })
  it('rejects junk', () => {
    expect(parseLocalRecord(null)).toBeNull()
    expect(parseLocalRecord('nope')).toBeNull()
    expect(parseLocalRecord('{"status":"done","version":1}')).toBeNull()
  })
})

describe('effectiveStatus', () => {
  it('an unsynced local write beats the server', () => {
    expect(effectiveStatus(server(), { status: 'skipped', version: 1, synced: false })?.status).toBe('skipped')
  })
  it('a synced local copy defers to the server', () => {
    expect(effectiveStatus(server({ status: 'pending' }), { status: 'completed', version: 1, synced: true })?.status).toBe('pending')
  })
  it('nothing known means nothing to act on', () => {
    expect(effectiveStatus(null, null)).toBeNull()
  })
})

describe('shouldShow', () => {
  it('shows pending, hides skipped and completed', () => {
    expect(shouldShow({ status: 'pending', version: 1 })).toBe(true)
    expect(shouldShow({ status: 'skipped', version: 1 })).toBe(false)
    expect(shouldShow({ status: 'completed', version: 1 })).toBe(false)
  })
  it('shows again for a newer tour version', () => {
    expect(shouldShow({ status: 'completed', version: 1 }, 2)).toBe(true)
  })
  it('stays hidden when the status is unknown (API down)', () => {
    expect(shouldShow(null)).toBe(false)
  })
})
