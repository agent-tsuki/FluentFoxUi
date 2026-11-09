import type { KanaChar } from '@/types'
import type { KanjiEntry, KanjiLevelIndex } from '@/types/kanji'
import type { GrammarChapterSummary } from '@/types/grammar'
import type { KanaGroup, KanaUnit } from '@/lib/content/kana/courseTypes'
import { isKanaMark, isTypeableKana } from '@/lib/content/kana/kanaMarks'
import type { GrammarBankItem } from '@/lib/content/grammar/questionBank'
import { kanaQuestions } from './kanaQuestions'
import { kanjiQuestions, vocabOf, vocabQuestions } from './kanjiQuestions'
import { grammarQuestions } from './grammarQuestions'
import type { TestFormatId, TestQuestion } from './types'

/** One thing the learner can include in a test: a kana row, a kanji unit, a grammar chapter. */
export interface ScopeItem {
  id: string
  title: string
  /** How many things it adds (kana, kanji, words or sentences). */
  size: number
  /** A few characters that show what's inside. */
  preview?: string
}

export interface ScopeGroup {
  id: string
  title: string
  items: ScopeItem[]
}

/** A subject's content for one level, ready to build tests from. */
export interface TestSource {
  groups: ScopeGroup[]
  /** What one counted thing is called, e.g. "kana", "kanji", "words", "sentences". */
  unit: string
  build(scope: readonly string[], formats: readonly TestFormatId[], count: number, random?: () => number): TestQuestion[]
}

const PREVIEW = 4

// ─── Kana ────────────────────────────────────────────────────────────────────

export function kanaSource(
  units: readonly KanaUnit[],
  groups: readonly KanaGroup[],
  all: readonly KanaChar[],
  lookAlikes: Readonly<Record<string, readonly string[]>>,
): TestSource {
  const byId = new Map(all.map((k) => [k.id, k]))
  // ー and small ッ have no romaji of their own, so they are never asked.
  const askable = (k?: KanaChar): k is KanaChar => k !== undefined && !k.isEmpty && !isKanaMark(k) && isTypeableKana(k)
  const kanaOf = (unit: KanaUnit) => unit.kanaIds.map((id) => byId.get(id)).filter(askable)
  const unitById = new Map(units.map((u) => [u.id, u]))
  return {
    unit: 'kana',
    groups: groups
      .map((g) => ({
        id: g.id,
        title: g.title,
        items: g.unitIds.flatMap((id) => {
          const u = unitById.get(id)
          const kana = u ? kanaOf(u) : []
          return u && kana.length
            ? [
                {
                  id: u.id,
                  title: u.title,
                  size: kana.length,
                  preview: kana
                    .slice(0, PREVIEW)
                    .map((k) => k.character)
                    .join(''),
                },
              ]
            : []
        }),
      }))
      .filter((g) => g.items.length > 0),
    build(scope, formats, count, random) {
      const kana = scope.flatMap((id) => {
        const u = unitById.get(id)
        return u ? kanaOf(u) : []
      })
      return kanaQuestions({ kana, all, lookAlikes, formats, count, random })
    },
  }
}

// ─── Kanji & vocabulary ──────────────────────────────────────────────────────

function kanjiGroups(
  index: KanjiLevelIndex,
  byChar: ReadonlyMap<string, KanjiEntry>,
  sizeOf: (entries: KanjiEntry[]) => number,
): ScopeGroup[] {
  const unitById = new Map(index.units.map((u) => [u.id, u]))
  return index.groups
    .map((g) => ({
      id: g.id,
      title: g.title,
      items: g.unitIds.flatMap((id) => {
        const u = unitById.get(id)
        if (!u) return []
        const entries = u.kanji.flatMap((c) => byChar.get(c) ?? [])
        const size = sizeOf(entries)
        return size ? [{ id: u.id, title: u.title, size, preview: u.kanji.slice(0, PREVIEW).join('') }] : []
      }),
    }))
    .filter((g) => g.items.length > 0)
}

function entriesIn(index: KanjiLevelIndex, byChar: ReadonlyMap<string, KanjiEntry>, scope: readonly string[]): KanjiEntry[] {
  const wanted = new Set(scope)
  return index.units.filter((u) => wanted.has(u.id)).flatMap((u) => u.kanji.flatMap((c) => byChar.get(c) ?? []))
}

export function kanjiSource(index: KanjiLevelIndex, entries: readonly KanjiEntry[], byChar: ReadonlyMap<string, KanjiEntry>): TestSource {
  return {
    unit: 'kanji',
    groups: kanjiGroups(index, byChar, (e) => e.length),
    build: (scope, formats, count, random) =>
      kanjiQuestions({ entries: entriesIn(index, byChar, scope), pool: entries, formats, count, random }),
  }
}

export function vocabSource(index: KanjiLevelIndex, entries: readonly KanjiEntry[], byChar: ReadonlyMap<string, KanjiEntry>): TestSource {
  const pool = vocabOf(entries)
  return {
    unit: 'words',
    groups: kanjiGroups(index, byChar, (e) => vocabOf(e).length),
    build: (scope, formats, count, random) =>
      vocabQuestions({ words: vocabOf(entriesIn(index, byChar, scope)), pool, formats, count, random }),
  }
}

// ─── Grammar ─────────────────────────────────────────────────────────────────

/** Chapters per group on the setup page (1–5, 6–10, …). */
const CHAPTERS_PER_GROUP = 5

export function grammarSource(chapters: readonly GrammarChapterSummary[], items: readonly GrammarBankItem[]): TestSource {
  const asked = chapters
    .map((c) => ({ id: String(c.id), title: c.title, size: items.filter((i) => i.chapter === c.id).length, preview: `${c.id}` }))
    .filter((c) => c.size > 0)
  const groups: ScopeGroup[] = []
  for (let i = 0; i < asked.length; i += CHAPTERS_PER_GROUP) {
    const slice = asked.slice(i, i + CHAPTERS_PER_GROUP)
    groups.push({ id: `g${i}`, title: `Chapters ${slice[0].preview}–${slice[slice.length - 1].preview}`, items: slice })
  }
  return {
    unit: 'sentences',
    groups,
    build(scope, formats, count, random) {
      const wanted = new Set(scope.map(Number))
      return grammarQuestions({ items: items.filter((i) => wanted.has(i.chapter)), pool: items, formats, count, random })
    },
  }
}
