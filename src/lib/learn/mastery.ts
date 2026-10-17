/**
 * Mastery levels from the progress API (plan §7.4): New · Learning ·
 * Familiar · Strong · Mastered, with one colour each (grey, red, yellow,
 * blue, green) used by every bar, chip, chart cell and kanji stage. Pure.
 */
import type { ItemLevelEntry, ItemsPerLevel, MasteryLevel } from '@/types/progress'

const PERCENT = 100

export const MASTERY_LEVELS: readonly MasteryLevel[] = ['new', 'learning', 'familiar', 'strong', 'mastered']

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  new: 'New',
  learning: 'Learning',
  familiar: 'Familiar',
  strong: 'Strong',
  mastered: 'Mastered',
}

export const MASTERY_HINT: Record<MasteryLevel, string> = {
  new: 'Not started yet',
  learning: 'Just introduced, or slipped and being relearned',
  familiar: 'Remembered for 1–7 days',
  strong: 'Remembered for 1–3 weeks',
  mastered: 'Remembered for 3 weeks or more',
}

export interface MasteryTone {
  /** Solid fill: bar segments, legend dots. */
  fill: string
  /** Text in the level's colour. */
  text: string
  /** Soft chip / cell background with a matching border. */
  soft: string
}

// Literal class names so Tailwind keeps them. Semantic tokens switch for dark mode.
export const MASTERY_TONE: Record<MasteryLevel, MasteryTone> = {
  new: { fill: 'bg-outline-variant', text: 'text-on-surface-variant', soft: 'bg-surface-container-high border-outline-variant' },
  learning: { fill: 'bg-error', text: 'text-error', soft: 'bg-error/10 border-error/50' },
  familiar: { fill: 'bg-warning', text: 'text-warning', soft: 'bg-warning/10 border-warning/50' },
  strong: { fill: 'bg-info', text: 'text-info', soft: 'bg-info/10 border-info/50' },
  mastered: { fill: 'bg-success', text: 'text-success', soft: 'bg-success/15 border-success/60' },
}

export function isMasteryLevel(value: string): value is MasteryLevel {
  return (MASTERY_LEVELS as readonly string[]).includes(value)
}

/** Unknown levels read as new, so a newer server never breaks the colours. */
export function toMasteryLevel(value: string | undefined): MasteryLevel {
  return value !== undefined && isMasteryLevel(value) ? value : 'new'
}

export interface LevelSegment {
  level: MasteryLevel
  count: number
  /** Share of the bar, 0–100. */
  pct: number
}

/**
 * One stacked bar's segments, New first. Empty levels are left out; the
 * shares add up to 100 (or the bar is empty when there are no items).
 */
export function levelSegments(perLevel: ItemsPerLevel): LevelSegment[] {
  const total = MASTERY_LEVELS.reduce((n, l) => n + perLevel[l], 0)
  if (total === 0) return []
  return MASTERY_LEVELS.filter((l) => perLevel[l] > 0).map((level) => ({
    level,
    count: perLevel[level],
    pct: (perLevel[level] / total) * PERCENT,
  }))
}

/** Items started: every level but New. */
export function startedCount(perLevel: ItemsPerLevel): number {
  return perLevel.learning + perLevel.familiar + perLevel.strong + perLevel.mastered
}

/** Character → level, for chart cells and kanji stages. */
export function levelsByChar(entries: readonly ItemLevelEntry[]): ReadonlyMap<string, MasteryLevel> {
  return new Map(entries.map((e) => [e.char, toMasteryLevel(e.level)]))
}

/** How many of `chars` sit at each level (unknown characters count as new). */
export function countLevels(chars: readonly string[], levelOf: (char: string) => MasteryLevel): ItemsPerLevel {
  const counts: ItemsPerLevel = { new: 0, learning: 0, familiar: 0, strong: 0, mastered: 0 }
  for (const c of chars) counts[levelOf(c)] += 1
  return counts
}
