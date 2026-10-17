import { describe, expect, it } from 'vitest'
import type { KanaSection, KanaType } from '@/types'
import type { KanaContentChar } from '@/types/content'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { buildKanaSections, layOutSection } from '@/lib/content/kana/buildKanaSections'
import { mockHiraganaSections } from '@/api/mock/hiragana'
import { mockKatakanaSections } from '@/api/mock/katakana'
import { HIRAGANA_UNITS } from '@/lib/content/kana/hiraganaUnits'
import { KATAKANA_UNITS } from '@/lib/content/kana/katakanaUnits'

/** The bundled chart, flattened into the API's path-ordered kana list. */
function asApiKana(sections: KanaSection[], units: readonly KanaUnit[]): KanaContentChar[] {
  const unitOf = new Map(units.flatMap((u) => u.kanaIds.map((id) => [id, u.id] as const)))
  return sections
    .flatMap((s) => s.chars)
    .filter((k) => !k.isEmpty)
    .map((k, i) => ({
      id: k.id,
      character: k.character,
      romaji: k.romaji,
      type: k.type,
      isCompound: k.isCompound,
      altRomaji: [],
      groupId: k.type,
      unitId: unitOf.get(k.id) ?? 'unknown',
      position: i + 1,
      lookAlikes: [],
    }))
}

function kana(id: string, romaji: string, type: KanaType, unitId: string, position: number): KanaContentChar {
  return { id, character: id, romaji, type, altRomaji: [], groupId: type, unitId, position, lookAlikes: [] }
}

describe('buildKanaSections', () => {
  it.each([
    ['hiragana', 'Hiragana', mockHiraganaSections, HIRAGANA_UNITS],
    ['katakana', 'Katakana', mockKatakanaSections, KATAKANA_UNITS],
  ] as const)('lays out %s exactly like the bundled chart', (_script, label, sections, units) => {
    expect(buildKanaSections(asApiKana(sections, units), label)).toEqual(sections)
  })

  it('orders kana by position, whatever order the API sends them in', () => {
    const list = asApiKana(mockHiraganaSections, HIRAGANA_UNITS).reverse()
    expect(buildKanaSections(list, 'Hiragana')).toEqual(mockHiraganaSections)
  })

  it('leaves out sections with no kana and kana of unknown types', () => {
    const sections = buildKanaSections([kana('a', 'a', 'basic', 'a', 1), { ...kana('x', 'x', 'basic', 'x', 2), type: 'mystery' }], 'Hiragana')
    expect(sections.map((s) => s.id)).toEqual(['basic'])
    expect(sections[0].chars.map((c) => c.id)).toEqual(['a'])
  })

  it('marks only two-part kana as compound', () => {
    const [section] = buildKanaSections([{ ...kana('kya', 'kya', 'compound', 'c', 1), isCompound: true }, kana('kyu', 'kyu', 'compound', 'c', 2)], 'Hiragana')
    expect(section.chars[0].isCompound).toBe(true)
    expect(section.chars[1]).not.toHaveProperty('isCompound')
  })
})

describe('layOutSection', () => {
  const vowelGrid = { id: 'basic', columns: 5, vowelColumns: 'aiueo' } as const

  it('puts each kana in its vowel column and fills skipped columns with numbered gaps', () => {
    const cells = layOutSection([kana('ya', 'ya', 'basic', 'ya', 1), kana('yu', 'yu', 'basic', 'ya', 2), kana('yo', 'yo', 'basic', 'ya', 3)], vowelGrid)
    expect(cells.map((c) => c.id)).toEqual(['ya', '_ya1', 'yu', '_ya2', 'yo'])
    expect(cells[1]).toMatchObject({ isEmpty: true, character: '', romaji: '', type: 'basic' })
  })

  it('starts a new row when a kana belongs left of the cursor', () => {
    const cells = layOutSection([kana('ka', 'ka', 'basic', 'k', 1), kana('ki', 'ki', 'basic', 'k', 2), kana('sa', 'sa', 'basic', 's', 3)], vowelGrid)
    expect(cells.map((c) => c.id)).toEqual(['ka', 'ki', '_s1', '_s2', '_s3', 'sa'])
  })

  it('places a kana without a vowel (ん) in the next free cell', () => {
    const cells = layOutSection([kana('wo', 'wo', 'basic', 'wa', 1), kana('n', 'n', 'basic', 'wa', 2)], vowelGrid)
    expect(cells.map((c) => c.id)).toEqual(['_wa1', '_wa2', '_wa3', '_wa4', 'wo', 'n'])
  })

  it('lets kana flow without gaps when the section has no vowel columns', () => {
    const cells = layOutSection([kana('fa', 'fa', 'foreign', 'f', 1), kana('fe', 'fe', 'foreign', 'f', 2)], { id: 'foreign', columns: 4, vowelColumns: null })
    expect(cells.map((c) => c.id)).toEqual(['fa', 'fe'])
  })
})
