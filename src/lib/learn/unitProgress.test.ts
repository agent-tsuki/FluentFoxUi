import { describe, expect, it } from 'vitest'
import { EMPTY_LOCAL_PATH, mergePath, parseLocalPath, toUnitProgress, unitsBySlug } from '@/lib/learn/unitProgress'
import type { UnitProgressData } from '@/types/learn'

function unit(slug: string, extra: Partial<UnitProgressData> = {}): UnitProgressData {
  return {
    unit_type: 'kana',
    unit_id: `uuid-${slug}`,
    unit_slug: slug,
    track: 'hiragana',
    watched_at: null,
    traced_at: null,
    written_at: null,
    practised_at: null,
    quiz_best_pct: null,
    completed_at: null,
    ...extra,
  }
}

describe('toUnitProgress', () => {
  it('leaves out every step not done', () => {
    expect(toUnitProgress(unit('ka'))).toEqual({})
  })

  it('maps each step, the quiz best as 0–1 and completion as the quiz pass', () => {
    const p = toUnitProgress(
      unit('ka', {
        watched_at: 'w',
        traced_at: 't',
        written_at: 'wr',
        practised_at: 'p',
        quiz_best_pct: 80,
        completed_at: 'c',
      }),
    )
    expect(p).toEqual({ watchedAt: 'w', tracedAt: 't', writtenAt: 'wr', practisedAt: 'p', quizBest: 0.8, quizPassedAt: 'c' })
  })

  it('keeps a quiz best of zero', () => {
    expect(toUnitProgress(unit('ka', { quiz_best_pct: 0 })).quizBest).toBe(0)
  })
})

describe('unitsBySlug', () => {
  it('keys units by their slug, the id the course pages use', () => {
    const map = unitsBySlug([unit('a'), unit('ka', { practised_at: 'p' })])
    expect(Object.keys(map)).toEqual(['a', 'ka'])
    expect(map.ka).toEqual({ practisedAt: 'p' })
  })
})

describe('mergePath', () => {
  it("adds this device's print dates and the tested-out units and test results", () => {
    const state = mergePath(
      { ka: { practisedAt: 'p' } },
      { version: 3, units: { ka: { printedAt: 'pr' } }, certificateName: 'Aiko' },
      { finalTest: { best: 0.9, passedAt: 'f' }, skipTests: { all: 0.5 }, testedOut: { sa: '2026-10-01' } },
    )
    expect(state).toEqual({
      version: 1,
      units: { ka: { practisedAt: 'p', printedAt: 'pr' }, sa: { skippedAt: '2026-10-01' } },
      finalTest: { best: 0.9, passedAt: 'f', certificateName: 'Aiko' },
      skipTests: { all: 0.5 },
    })
  })

  it('hides a skip put back in the path after it was taken', () => {
    const state = mergePath({}, { version: 3, units: { sa: { skipUndoneAt: '2026-10-02' } } }, { skipTests: {}, testedOut: { sa: '2026-10-01' } })
    expect(state.units.sa).toBeUndefined()
  })

  it('counts a skip passed again after it was put back', () => {
    const state = mergePath({}, { version: 3, units: { sa: { skipUndoneAt: '2026-10-02' } } }, { skipTests: {}, testedOut: { sa: '2026-10-03' } })
    expect(state.units.sa).toEqual({ skippedAt: '2026-10-03' })
  })

  it('keeps the certificate name off the path until a final test exists', () => {
    expect(mergePath({}, { version: 3, units: {}, certificateName: 'Aiko' }).finalTest).toBeUndefined()
  })

  it('gives an empty path for no data', () => {
    expect(mergePath({}, EMPTY_LOCAL_PATH)).toEqual({ version: 1, units: {}, skipTests: {} })
  })
})

describe('parseLocalPath', () => {
  it('reads a stored record', () => {
    const record = { version: 3, units: { ka: { printedAt: 'x', skipUndoneAt: 'y' } }, certificateName: 'Aiko' }
    expect(parseLocalPath(JSON.stringify(record))).toEqual(record)
  })

  it('keeps print dates and the certificate name of a version 2 record and drops its test results', () => {
    const old = {
      version: 2,
      units: { ka: { printedAt: 'x' }, sa: { skippedAt: 's' } },
      finalTest: { best: 0.9, certificateName: 'Aiko' },
      skipTests: { all: 0.5 },
    }
    expect(parseLocalPath(JSON.stringify(old))).toEqual({ version: 3, units: { ka: { printedAt: 'x' } }, certificateName: 'Aiko' })
  })

  it.each([
    ['nothing stored', null],
    ['broken JSON', '{'],
    ['the old version 1 shape', JSON.stringify({ version: 1, units: {} })],
    ['null', 'null'],
  ])('reads %s as empty', (_name, raw) => {
    expect(parseLocalPath(raw)).toEqual(EMPTY_LOCAL_PATH)
  })
})
