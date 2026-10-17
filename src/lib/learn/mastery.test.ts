import { describe, expect, it } from 'vitest'
import { MASTERY_LEVELS, MASTERY_TONE, countLevels, levelSegments, levelsByChar, startedCount, toMasteryLevel } from '@/lib/learn/mastery'
import type { ItemsPerLevel } from '@/types/progress'

const per = (p: Partial<ItemsPerLevel>): ItemsPerLevel => ({ new: 0, learning: 0, familiar: 0, strong: 0, mastered: 0, ...p })

describe('MASTERY_TONE', () => {
  const cases = [
    { level: 'new', fill: 'bg-outline-variant' },
    { level: 'learning', fill: 'bg-error' },
    { level: 'familiar', fill: 'bg-warning' },
    { level: 'strong', fill: 'bg-info' },
    { level: 'mastered', fill: 'bg-success' },
  ] as const
  for (const c of cases) {
    it(`colours ${c.level} with ${c.fill}`, () => {
      expect(MASTERY_TONE[c.level].fill).toBe(c.fill)
    })
  }

  it('orders levels from New to Mastered', () => {
    expect(MASTERY_LEVELS).toEqual(['new', 'learning', 'familiar', 'strong', 'mastered'])
  })
})

describe('toMasteryLevel', () => {
  it('keeps a known level', () => {
    expect(toMasteryLevel('strong')).toBe('strong')
  })

  it('reads an unknown or missing level as new', () => {
    expect(toMasteryLevel('legendary')).toBe('new')
    expect(toMasteryLevel(undefined)).toBe('new')
  })
})

describe('levelSegments', () => {
  it('gives no segments for an empty track', () => {
    expect(levelSegments(per({}))).toEqual([])
  })

  it('leaves out empty levels and splits the bar by share', () => {
    const segments = levelSegments(per({ new: 2, familiar: 1, mastered: 1 }))
    expect(segments.map((s) => s.level)).toEqual(['new', 'familiar', 'mastered'])
    expect(segments.map((s) => s.pct)).toEqual([50, 25, 25])
  })

  it('adds up to 100 for uneven counts', () => {
    const total = levelSegments(per({ new: 1, learning: 1, strong: 1 })).reduce((n, s) => n + s.pct, 0)
    expect(total).toBeCloseTo(100)
  })
})

describe('startedCount', () => {
  it('counts every level but new', () => {
    expect(startedCount(per({ new: 5, learning: 1, familiar: 2, strong: 3, mastered: 4 }))).toBe(10)
  })
})

describe('levelsByChar and countLevels', () => {
  const levels = levelsByChar([
    { item_id: '1', char: 'あ', level: 'mastered' },
    { item_id: '2', char: 'い', level: 'learning' },
  ])
  const levelOf = (c: string) => levels.get(c) ?? 'new'

  it('looks items up by character', () => {
    expect(levelOf('あ')).toBe('mastered')
    expect(levelOf('う')).toBe('new')
  })

  it('counts characters per level, unknown ones as new', () => {
    expect(countLevels(['あ', 'い', 'う'], levelOf)).toEqual(per({ new: 1, learning: 1, mastered: 1 }))
  })
})
