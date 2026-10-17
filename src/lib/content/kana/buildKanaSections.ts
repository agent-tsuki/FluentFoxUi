/**
 * Builds the kana chart grid (`KanaSection[]`) from the content API's flat
 * kana list (`GET /content/kana/{script}`). The API sends kana in path order
 * with their chart type; the grid layout (columns, gaps in the や and わ
 * rows) is a presentation choice, so it lives here, matching the bundled chart.
 */
import type { KanaChar, KanaSection, KanaType } from '@/types'
import type { KanaContentChar } from '@/types/content'

interface SectionLayout {
  id: KanaType
  title: (scriptLabel: string) => string
  accentColor: KanaSection['accentColor']
  columns: number
  /**
   * The vowel each column holds, left to right. A kana whose romaji ends in
   * one of them goes in that column, leaving gaps (や _ ゆ _ よ). Null: kana
   * simply flow left to right.
   */
  vowelColumns: string | null
}

const SECTION_LAYOUTS: readonly SectionLayout[] = [
  { id: 'basic', title: (label) => `Basic ${label}`, accentColor: 'primary', columns: 5, vowelColumns: 'aiueo' },
  { id: 'dakuten', title: () => 'Dakuten / Han-Dakuten', accentColor: 'tertiary', columns: 5, vowelColumns: 'aiueo' },
  { id: 'compound', title: () => 'Combinations (Yōon)', accentColor: 'primary', columns: 3, vowelColumns: 'auo' },
  { id: 'foreign', title: () => 'Foreign sounds', accentColor: 'tertiary', columns: 4, vowelColumns: null },
]

/** Column of a kana in a vowel-ordered grid, or null when its romaji ends in no listed vowel (ん). */
function vowelColumn(romaji: string, vowels: string): number | null {
  const index = vowels.indexOf(romaji.slice(-1))
  return index === -1 ? null : index
}

function toChartChar(k: KanaContentChar, type: KanaType): KanaChar {
  const char: KanaChar = { id: k.id, character: k.character, romaji: k.romaji, type }
  if (k.isCompound) char.isCompound = true
  return char
}

/** Lays one section's kana out on its grid, inserting empty placeholder cells where a column is skipped. */
export function layOutSection(kana: readonly KanaContentChar[], layout: Pick<SectionLayout, 'id' | 'columns' | 'vowelColumns'>): KanaChar[] {
  const cells: KanaChar[] = []
  const gapsPerUnit = new Map<string, number>()
  const addGap = (k: KanaContentChar) => {
    const n = (gapsPerUnit.get(k.unitId) ?? 0) + 1
    gapsPerUnit.set(k.unitId, n)
    cells.push({ id: `_${k.unitId}${n}`, character: '', romaji: '', type: layout.id, isEmpty: true })
  }
  for (const k of kana) {
    const target = layout.vowelColumns ? vowelColumn(k.romaji, layout.vowelColumns) : null
    if (target !== null) {
      // A column left of the cursor starts a new row; then skip to the kana's column.
      if (target < cells.length % layout.columns) while (cells.length % layout.columns !== 0) addGap(k)
      while (cells.length % layout.columns < target) addGap(k)
    }
    cells.push(toChartChar(k, layout.id))
  }
  return cells
}

/**
 * The chart sections of one script, in chart order (basic, dakuten,
 * combinations, foreign). Kana of a type the chart has no layout for are left out.
 */
export function buildKanaSections(kana: readonly KanaContentChar[], scriptLabel: string): KanaSection[] {
  const ordered = [...kana].sort((a, b) => a.position - b.position)
  return SECTION_LAYOUTS.flatMap((layout) => {
    const members = ordered.filter((k) => k.type === layout.id)
    if (members.length === 0) return []
    return [
      {
        id: layout.id,
        title: layout.title(scriptLabel),
        accentColor: layout.accentColor,
        columns: layout.columns,
        chars: layOutSection(members, layout),
      },
    ]
  })
}
