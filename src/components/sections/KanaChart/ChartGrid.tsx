import { memo, useMemo, type CSSProperties, type ReactNode } from 'react'
import type { KanaChar, KanaSection } from '@/types'
import type { KanaMastery } from '@/types/kanaProgress'
import { cn } from '@/lib/cn'
import { CharCard } from './CharCard'

interface ChartGridProps {
  section: KanaSection
  /** Visible h2. */
  title: string
  mastery: (id: string) => KanaMastery
  showRomaji: boolean
  onSelect: (char: KanaChar) => void
  /**
   * Content for the free tracks beside a short table at ≥ lg (Dakuten uses 5
   * of the 11 tracks). It spans the table's full height there and stacks
   * under the grid on smaller screens.
   */
  aside?: ReactNode
}

interface Group {
  /** Consonant label, e.g. "k", "∅", "ん". */
  label: string
  chars: KanaChar[]
}

const VOWEL_END = /[aiueo]$/

/** "ka" → "k", "a" → "∅", "kya" → "ky"; a kana without a vowel (ん) labels itself. */
function groupLabel(chars: KanaChar[]): string {
  const first = chars.find((c) => !c.isEmpty)
  if (!first) return ''
  if (!VOWEL_END.test(first.romaji)) return first.character
  return first.romaji.replace(VOWEL_END, '') || '∅'
}

/**
 * Splits the section into its data rows (one consonant group each: か き く け こ),
 * padding a short last group (ん) with empty slots so the table stays square.
 */
function toGroups(section: KanaSection): Group[] {
  const size = section.columns
  const groups: Group[] = []
  for (let i = 0; i < section.chars.length; i += size) {
    const chars = section.chars.slice(i, i + size)
    for (let k = chars.length; k < size; k++) {
      chars.push({ id: `_pad-${section.id}-${i}-${k}`, character: '', romaji: '', type: chars[0].type, isEmpty: true })
    }
    groups.push({ label: groupLabel(chars), chars })
  }
  return groups
}

const vowelOf = (c: KanaChar) => c.romaji.replace(/^[^aiueoy]+/, '')

/** Vowel axis ("a i u e o", "ya yu yo"): the first group's romaji minus its leading consonant. */
function vowelLabels(groups: Group[]): string[] {
  return (groups[0]?.chars ?? []).map((c) => (c.isEmpty ? '' : vowelOf(c)))
}

/**
 * A real gojūon-style table: every column keeps one vowel (a lone ん row
 * excepted). Katakana's foreign sounds (ー, ッ, ファ, ティ…) aren't one, so
 * they get a plain grid without axis labels.
 */
function isTable(groups: Group[], vowels: string[]): boolean {
  return groups.every((g) => {
    const real = g.chars.filter((c) => !c.isEmpty)
    if (real.length === 1 && !VOWEL_END.test(real[0]?.romaji ?? '')) return true
    return g.chars.every((c, j) => c.isEmpty || vowelOf(c) === vowels[j])
  })
}

/**
 * Grid placement through CSS variables, so one DOM serves both layouts:
 * phone / md = data rows across (rows of 5, Yōon rows of 3); ≥ lg = the
 * transposed gojūon table (one consonant group per column, vowels down).
 */
function place(row: number, col: number | string, lgRow: number | string, lgCol: number | string): CSSProperties {
  return { '--r': row, '--c': col, '--lr': lgRow, '--lc': lgCol } as CSSProperties
}
const PLACED = '[grid-row:var(--r)] [grid-column:var(--c)] lg:[grid-row:var(--lr)] lg:[grid-column:var(--lc)]'

const PHONE_COLS: Record<number, string> = { 3: 'grid-cols-3', 5: 'grid-cols-5' }

const AXIS = 'self-end text-center text-xs font-semibold tracking-wide text-on-surface-variant tabular-nums'

/** One chart set: h2, axis labels and the cells. */
export const ChartGrid = memo(function ChartGrid({ section, title, mastery, showRomaji, onSelect, aside }: ChartGridProps) {
  const groups = useMemo(() => toGroups(section), [section])
  const vowels = useMemo(() => vowelLabels(groups), [groups])
  const table = useMemo(() => isTable(groups, vowels), [groups, vowels])
  const headingId = `chart-${section.id}`
  const rows = section.columns

  if (!table) {
    // Plain grid in data order (four across on phones, wider from sm).
    return (
      <section aria-labelledby={headingId} className="scroll-mt-40">
        <h2 id={headingId} className="mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl">
          {title}
        </h2>
        <div data-chart-grid={section.id} className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 md:max-w-xl lg:max-w-none lg:grid-cols-11 lg:gap-2">
          {section.chars
            .filter((c) => !c.isEmpty)
            .map((char) => (
              <div key={char.id} className="min-w-0">
                <CharCard char={char} size="sm" mastery={mastery(char.id)} showRomaji={showRomaji} onSelect={onSelect} />
              </div>
            ))}
        </div>
        {aside && <div className="mt-4 min-w-0">{aside}</div>}
      </section>
    )
  }

  return (
    <section aria-labelledby={headingId} className="scroll-mt-40">
      <h2 id={headingId} className="mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl">
        {title}
      </h2>

      <div
        data-chart-grid={section.id}
        className={cn(
          'grid gap-1.5 md:max-w-xl lg:max-w-none lg:grid-cols-[2rem_repeat(11,minmax(0,1fr))] lg:gap-2',
          PHONE_COLS[section.columns] ?? 'grid-cols-5',
        )}
      >
        {/* Phone / md: vowel headers across the top. */}
        {vowels.map((v, j) => (
          <span key={`v-${j}`} aria-hidden className={cn(AXIS, PLACED, 'lg:hidden')} style={place(1, j + 1, 1, 1)}>
            {v}
          </span>
        ))}

        {/* ≥ lg: consonant headers across the top, vowels down the side. */}
        {groups.map((g, i) => (
          <span key={`g-${i}`} aria-hidden className={cn(AXIS, PLACED, 'hidden lg:block')} style={place(1, 1, 1, i + 2)}>
            {g.label}
          </span>
        ))}
        {vowels.map((v, j) => (
          <span
            key={`lv-${j}`}
            aria-hidden
            className={cn(AXIS, PLACED, 'hidden self-center lg:block')}
            style={place(1, 1, j + 2, 1)}
          >
            {v}
          </span>
        ))}

        {groups.map((g, i) =>
          g.chars.map((char, j) => (
            <div key={char.id} className={cn(PLACED, 'min-w-0')} style={place(i + 2, j + 1, j + 2, i + 2)}>
              <CharCard
                char={char}
                size="sm"
                mastery={char.isEmpty ? 'new' : mastery(char.id)}
                showRomaji={showRomaji}
                onSelect={onSelect}
              />
            </div>
          )),
        )}

        {aside && (
          <div
            className={cn(PLACED, 'mt-4 min-w-0 lg:mt-0')}
            style={place(groups.length + 2, '1 / -1', `1 / ${rows + 2}`, `${groups.length + 2} / -1`)}
          >
            {aside}
          </div>
        )}
      </div>
    </section>
  )
})

