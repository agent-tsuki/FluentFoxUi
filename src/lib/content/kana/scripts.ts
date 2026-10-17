/**
 * The kana course engine's script registry. Every course page, component,
 * practice mode and PDF reads the current script's config (via
 * `useKanaScript()` inside a course route, or a config passed in) instead of
 * importing hiragana content directly, so katakana runs on the same code.
 *
 * Progress lives on the learn API (learningPathService for the path), not
 * here. The keys below are per-script UI preferences.
 */
import type { KanaSection } from '@/types'
import type { RawStrokeData } from '@/lib/pdf/glyphs'
import type { KanaGroup, KanaGroupId, KanaSkipScope, KanaUnit } from '@/lib/content/kana/courseTypes'
import type { PracticeWord, PracticeWordTier } from '@/lib/content/kana/practiceWords'
import type { KanaSampleWord } from '@/lib/content/kana/sampleWords'
import { KANA_SCRIPT_IDS, kanaBasePath, type KanaScriptId, type RegisteredKanaScriptId } from '@/lib/content/kana/scriptIds'
import { CERTIFICATE_TITLE, HIRAGANA_GROUPS, HIRAGANA_UNITS, PASS_MARK, SKIP_PASS_MARK } from '@/lib/content/kana/hiraganaUnits'
import { kanaMemoryHint } from '@/lib/content/kana/mnemonics'
import { KANA_SAMPLE_WORDS } from '@/lib/content/kana/sampleWords'
import { PRACTICE_WORDS } from '@/lib/content/kana/practiceWords'
import { HIRAGANA_LOOK_ALIKES } from '@/lib/content/kana/hiraganaLookAlikes'
import { hiraganaService } from '@/api/services/hiraganaService'
import { KATAKANA_CERTIFICATE_TITLE, KATAKANA_GROUPS, KATAKANA_UNITS } from '@/lib/content/kana/katakanaUnits'
import { katakanaMemoryHint } from '@/lib/content/kana/katakanaHints'
import { KATAKANA_SAMPLE_WORDS } from '@/lib/content/kana/katakanaSampleWords'
import { KATAKANA_WORDS } from '@/lib/content/kana/katakanaWords'
import { KATAKANA_LOOK_ALIKES } from '@/lib/content/kana/katakanaLookAlikes'
import { katakanaService } from '@/api/services/katakanaService'
import { kanaContentService } from '@/api/services/kanaContentService'

export { KANA_SCRIPT_IDS, kanaBasePath, type KanaScriptId, type RegisteredKanaScriptId }

/** A Word builder word. Katakana adds an 'extended' tier (ー, ッ, foreign sounds). */
export interface KanaPracticeWord extends Omit<PracticeWord, 'tier'> {
  tier: PracticeWordTier | 'extended'
}

/** One option of the chart's set switcher, mapped onto a data section. */
export interface KanaChartSetDef {
  /** `KanaSection.id` in the script's data. */
  sectionId: string
  /** `?set=` value (kept stable: old links use it). */
  param: string
  /** Switcher label, e.g. "Basic". */
  label: string
  /** The set's h2 on the chart, e.g. "Basic 46". */
  title: string
}

export interface KanaMarkPair {
  from: string
  to: string
  sound: string
}

/** The "How the marks work" aside beside the chart's dakuten table. */
export interface KanaChartMarks {
  /** Section the aside sits beside. */
  sectionId: string
  dakutenPairs: readonly KanaMarkPair[]
  handakutenPairs: readonly KanaMarkPair[]
  /** [rare, rare, common, common], e.g. ぢ づ → じ ず. */
  rareNote: readonly [string, string, string, string]
  /** Unit the aside links to. */
  unitId: string
}

/** Title + description of one skip ("test out") test; the list order is the scope order. */
export interface KanaSkipTestDef {
  scope: KanaSkipScope
  title: string
  covers: string
}

/** Per-script browser preferences (progress keys live in the services). */
export interface KanaScriptStorageKeys {
  hideRomaji: string
  rowsCelebrated: string
  speedBest: string
  buildDakuten: string
  /** The retired tab UI's key, removed on visit (hiragana only). */
  legacyTab?: string
}

export interface KanaScriptConfig {
  id: KanaScriptId
  /** "Hiragana" — lower-case it for running copy ("all hiragana"). */
  label: string
  /** "ひらがな" */
  nativeLabel: string
  /** "/kana/hiragana" */
  basePath: string
  /** The guided path, in order. */
  units: readonly KanaUnit[]
  groups: readonly KanaGroup[]
  /** Pass mark for unit quizzes, 0–1. */
  unitQuizPassMark: number
  /** Per-unit pass mark in a skip test, 0–1. */
  skipPassMark: number
  /** Skip tests offered, 'all' first. */
  skipTests: readonly KanaSkipTestDef[]
  /** Questions drawn per unit in a skip test; units not listed ask every kana once. */
  skipSample: Readonly<Record<string, number>>
  finalTest: {
    minutes: number
    passMark: number
    /** What "all N <kana>" covers, e.g. "basic, dakuten & handakuten, combinations". */
    covers: string
  }
  certificateTitle: string
  storageKeys: KanaScriptStorageKeys
  /** Chart set switcher labels; sections without an entry use their own id/title. */
  chartSets: readonly KanaChartSetDef[]
  chartMarks?: KanaChartMarks
  /** File-name slug for PDFs: foxsensei-<slug>-….pdf */
  pdfSlug: string
  /** The chart sections (spacers included), in order. */
  loadSections(): Promise<KanaSection[]>
  /** KanjiVG stroke data for this script (a lazy chunk; cached after the first call). */
  loadStrokes(): Promise<RawStrokeData>
  memoryHint(character: string, romaji: string): string | undefined
  /** One example word per kana id (katakana also has 'long' and 'sokuon'). */
  sampleWords: Readonly<Record<string, KanaSampleWord>>
  practiceWords: readonly KanaPracticeWord[]
  /** Look-alike characters per character (Word builder and quiz distractors). */
  lookAlikes: Readonly<Record<string, readonly string[]>>
}

/** Caches a lazy loader for the session; a failed load can be retried. */
function cached<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null
  return () => {
    if (!promise) {
      promise = load()
      promise.catch(() => {
        promise = null
      })
    }
    return promise
  }
}

const HIRAGANA: KanaScriptConfig = {
  id: 'hiragana',
  label: 'Hiragana',
  nativeLabel: 'ひらがな',
  basePath: kanaBasePath('hiragana'),
  units: HIRAGANA_UNITS,
  groups: HIRAGANA_GROUPS,
  unitQuizPassMark: PASS_MARK,
  skipPassMark: SKIP_PASS_MARK,
  skipTests: [
    {
      scope: 'all',
      title: 'Test out of all hiragana',
      covers: 'Every unit: the Basic 46 (あ to ん), dakuten & handakuten (が, ぱ) and the small ゃゅょ combinations.',
    },
    { scope: 'basic', title: 'Test out of the Basic 46', covers: 'The Basic 46, あ to ん: every kana once.' },
    { scope: 'dakuten', title: 'Test out of Dakuten', covers: 'Dakuten & handakuten: voiced sounds like が, ざ, ぱ.' },
    { scope: 'combo', title: 'Test out of Combinations', covers: 'Small ゃゅょ combinations, like きゃ, しゅ, ぎょ.' },
  ],
  skipSample: { dakuten: 15, 'combo-1': 10, 'combo-2': 8 },
  finalTest: { minutes: 14, passMark: PASS_MARK, covers: 'basic, dakuten & handakuten, combinations' },
  certificateTitle: CERTIFICATE_TITLE,
  storageKeys: {
    hideRomaji: 'ff-chart-hide-romaji-v1',
    rowsCelebrated: 'ff-kana-rows-celebrated-v1',
    speedBest: 'ff-kana-speed-best-v1',
    buildDakuten: 'ff-kana-build-dakuten-v1',
    legacyTab: 'ff-hiragana-tab',
  },
  chartSets: [
    { sectionId: 'basic', param: 'basic', label: 'Basic', title: 'Basic 46' },
    { sectionId: 'dakuten', param: 'dakuten', label: 'Dakuten', title: 'Dakuten & handakuten' },
    { sectionId: 'compound', param: 'yoon', label: 'Yōon', title: 'Combinations (Yōon)' },
  ],
  chartMarks: {
    sectionId: 'dakuten',
    dakutenPairs: [
      { from: 'か', to: 'が', sound: 'k → g' },
      { from: 'さ', to: 'ざ', sound: 's → z' },
      { from: 'た', to: 'だ', sound: 't → d' },
      { from: 'は', to: 'ば', sound: 'h → b' },
    ],
    handakutenPairs: [{ from: 'は', to: 'ぱ', sound: 'h → p' }],
    rareNote: ['ぢ', 'づ', 'じ', 'ず'],
    unitId: 'dakuten',
  },
  pdfSlug: 'hiragana',
  loadSections: () => hiraganaService.getSections(),
  loadStrokes: cached(() =>
    kanaContentService.getStrokes('hiragana', () => import('@/assets/kana-strokes/hiragana.json').then((m) => m.default as RawStrokeData)),
  ),
  memoryHint: kanaMemoryHint,
  sampleWords: KANA_SAMPLE_WORDS,
  practiceWords: PRACTICE_WORDS,
  lookAlikes: HIRAGANA_LOOK_ALIKES,
}

/**
 * Look-alike sets → a char → look-alikes map (every other char of each set it
 * appears in), plus small ッ vs big ツ, the classic size trap.
 */
function lookAlikeMap(sets: readonly { chars: readonly string[] }[], extra: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, Set<string>> = {}
  const add = (from: string, to: string) => {
    if (from !== to) (out[from] ??= new Set()).add(to)
  }
  for (const { chars } of sets) for (const a of chars) for (const b of chars) add(a, b)
  for (const [from, tos] of Object.entries(extra)) for (const to of tos) add(from, to)
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v]]))
}

const KATAKANA: KanaScriptConfig = {
  id: 'katakana',
  label: 'Katakana',
  nativeLabel: 'カタカナ',
  basePath: kanaBasePath('katakana'),
  units: KATAKANA_UNITS,
  groups: KATAKANA_GROUPS,
  unitQuizPassMark: PASS_MARK,
  skipPassMark: SKIP_PASS_MARK,
  skipTests: [
    {
      scope: 'all',
      title: 'Test out of all katakana',
      covers:
        'Every unit: the Basic 46 (ア to ン), dakuten & handakuten (ガ, パ), small ャュョ combinations, ー and small ッ, and the foreign sounds (ファ, ティ).',
    },
    { scope: 'basic', title: 'Test out of the Basic 46', covers: 'The Basic 46, ア to ン: every katakana once.' },
    { scope: 'dakuten', title: 'Test out of Dakuten', covers: 'Dakuten & handakuten: voiced sounds like ガ, ザ, パ.' },
    { scope: 'combo', title: 'Test out of Combinations', covers: 'Small ャュョ combinations, like キャ, シュ, ギョ.' },
    {
      scope: 'foreign',
      title: 'Test out of Foreign sounds',
      covers: 'Reading ー and small ッ in loanwords, plus the extra sounds like ファ, ティ, ヴァ, シェ.',
    },
  ],
  // ー and ッ are asked through loanwords; 4 words give the marks unit a fair score.
  skipSample: { dakuten: 15, 'combo-1': 10, 'combo-2': 8, marks: 4, foreign: 12 },
  // ~8 s per question, as for hiragana: 132 katakana in 18 minutes.
  finalTest: {
    minutes: 18,
    passMark: PASS_MARK,
    covers: 'basic, dakuten & handakuten, combinations, ー & ッ, foreign sounds',
  },
  certificateTitle: KATAKANA_CERTIFICATE_TITLE,
  storageKeys: {
    hideRomaji: 'ff-katakana-chart-hide-romaji-v1',
    rowsCelebrated: 'ff-katakana-rows-celebrated-v1',
    speedBest: 'ff-katakana-speed-best-v1',
    buildDakuten: 'ff-katakana-build-tier-v1',
  },
  chartSets: [
    { sectionId: 'basic', param: 'basic', label: 'Basic', title: 'Basic 46' },
    { sectionId: 'dakuten', param: 'dakuten', label: 'Dakuten', title: 'Dakuten & handakuten' },
    { sectionId: 'compound', param: 'yoon', label: 'Yōon', title: 'Combinations (Yōon)' },
    { sectionId: 'foreign', param: 'foreign', label: 'Foreign', title: 'Foreign sounds' },
  ],
  chartMarks: {
    sectionId: 'dakuten',
    dakutenPairs: [
      { from: 'カ', to: 'ガ', sound: 'k → g' },
      { from: 'サ', to: 'ザ', sound: 's → z' },
      { from: 'タ', to: 'ダ', sound: 't → d' },
      { from: 'ハ', to: 'バ', sound: 'h → b' },
    ],
    handakutenPairs: [{ from: 'ハ', to: 'パ', sound: 'h → p' }],
    rareNote: ['ヂ', 'ヅ', 'ジ', 'ズ'],
    unitId: 'dakuten',
  },
  pdfSlug: 'katakana',
  loadSections: () => katakanaService.getSections(),
  loadStrokes: cached(() =>
    kanaContentService.getStrokes('katakana', () => import('@/assets/kana-strokes/katakana.json').then((m) => m.default as RawStrokeData)),
  ),
  memoryHint: katakanaMemoryHint,
  sampleWords: {
    ...KATAKANA_SAMPLE_WORDS,
    long: { word: 'コーヒー (koohii)', meaning: 'coffee' },
    sokuon: { word: 'ベッド (beddo)', meaning: 'bed' },
  },
  practiceWords: KATAKANA_WORDS,
  lookAlikes: lookAlikeMap(KATAKANA_LOOK_ALIKES, { ッ: ['ツ', 'シ'], ツ: ['ッ'] }),
}

/**
 * Every registered script's config. The `Record` over RegisteredKanaScriptId
 * makes adding an id to KANA_SCRIPT_IDS without a config a compile error.
 */
export const KANA_SCRIPTS: Readonly<Record<RegisteredKanaScriptId, KanaScriptConfig>> = {
  hiragana: HIRAGANA,
  katakana: KATAKANA,
}

export function isRegisteredKanaScript(id: string | undefined): id is RegisteredKanaScriptId {
  return KANA_SCRIPT_IDS.some((s) => s === id)
}

// ─── Derived helpers (pure; take the config) ─────────────────────────────────

/** Total kana taught by the path (104 for hiragana). */
export function scriptKanaCount(script: KanaScriptConfig): number {
  return script.units.reduce((n, u) => n + u.kanaIds.length, 0)
}

/** Units of one group, in path order. */
export function unitsOfGroup(script: KanaScriptConfig, groupId: KanaGroupId): KanaUnit[] {
  const ids = script.groups.find((g) => g.id === groupId)?.unitIds ?? []
  return script.units.filter((u) => ids.includes(u.id))
}

/** Units covered by a skip scope, in path order. */
export function unitsForScope(script: KanaScriptConfig, scope: KanaSkipScope): KanaUnit[] {
  return scope === 'all' ? [...script.units] : unitsOfGroup(script, scope)
}

export function skipTestFor(script: KanaScriptConfig, scope: string | undefined): KanaSkipTestDef | undefined {
  return script.skipTests.find((t) => t.scope === scope)
}

/** The group a unit belongs to. */
export function groupOfUnit(script: KanaScriptConfig, unitId: string): KanaGroupId | undefined {
  return script.groups.find((g) => g.unitIds.includes(unitId))?.id
}
