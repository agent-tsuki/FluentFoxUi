import type { KanaChar } from '@/types'

export const ROUND_MS = 60_000
/** Rows unlocked at the start: あ, か, さ, た. */
const START_ROWS = 4
/** One more row every this many points. */
const POINTS_PER_ROW = 5

/** Chart rows in teaching order. ぢ/づ are left out (rare, and read like じ/ず). */
const ROWS: string[][] = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', 'yu', 'yo'],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', 'wo', 'n'],
  ['ga', 'gi', 'gu', 'ge', 'go'],
  ['za', 'ji', 'zu', 'ze', 'zo'],
  ['da', 'de', 'do'],
  ['ba', 'bi', 'bu', 'be', 'bo'],
  ['pa', 'pi', 'pu', 'pe', 'po'],
]

/** Other common romanizations accepted when typing (Kunrei/Nihon-shiki, IME habits). */
const VARIANTS: Record<string, string[]> = {
  shi: ['si'],
  chi: ['ti'],
  tsu: ['tu'],
  fu: ['hu'],
  ji: ['zi'],
  wo: ['o'],
  n: ['nn'],
  // Compounds (only prompted in combo unit sessions): Hepburn じゃ is "ja".
  sha: ['sya'], shu: ['syu'], sho: ['syo'],
  cha: ['tya', 'cya'], chu: ['tyu', 'cyu'], cho: ['tyo', 'cyo'],
  jya: ['ja', 'zya'], jyu: ['ju', 'zyu'], jyo: ['jo', 'zyo'],
}

export function acceptedAnswers(k: KanaChar): string[] {
  return [k.romaji, ...(VARIANTS[k.id] ?? [])]
}

export type TypedVerdict = 'correct' | 'pending' | 'wrong'

/** Judges typed text without needing Enter: exact match wins, a prefix waits. */
export function judgeTyped(k: KanaChar, raw: string): TypedVerdict {
  const value = raw.trim().toLowerCase()
  if (!value) return 'pending'
  const answers = acceptedAnswers(k)
  if (answers.includes(value)) return 'correct'
  return answers.some((a) => a.startsWith(value)) ? 'pending' : 'wrong'
}

/** Kana ids that sound like another (ぢ/じ, づ/ず): never prompted. */
const SKIPPED = new Set(['dji', 'dzu'])

/**
 * The kana grouped into rows, in teaching order. Kana outside ROWS (the
 * compounds) only count when nothing else is playable, i.e. a compound unit
 * session (?unit=combo-*); they're grouped by their consonant (kya/kyu/kyo).
 */
function playableRows(kana: KanaChar[]): KanaChar[][] {
  const byId = new Map(kana.map((k) => [k.id, k]))
  const rows = ROWS.map((row) => row.map((id) => byId.get(id)).filter((k): k is KanaChar => !!k)).filter(
    (row) => row.length > 0,
  )
  if (rows.length > 0) return rows
  const groups = new Map<string, KanaChar[]>()
  for (const k of kana) {
    if (SKIPPED.has(k.id)) continue
    const key = k.romaji.slice(0, -1)
    groups.set(key, [...(groups.get(key) ?? []), k])
  }
  return [...groups.values()]
}

/** Kana playable at this score, in chart order. */
export function poolForScore(kana: KanaChar[], score: number): KanaChar[] {
  const rows = playableRows(kana)
  const unlocked = Math.min(rows.length, START_ROWS + Math.floor(score / POINTS_PER_ROW))
  return rows.slice(0, unlocked).flat()
}

/** The row count unlocked at this score (for the "new row" hint). */
export function rowsUnlocked(kana: KanaChar[], score: number): number {
  const available = playableRows(kana).length
  return Math.min(available, START_ROWS + Math.floor(score / POINTS_PER_ROW))
}

function sample<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

/**
 * Next kana: never one of the last two shown; one time in four, a kana the
 * learner already missed this round (if it's in the pool) to reinforce it.
 */
export function pickNext(pool: KanaChar[], recent: string[], missedIds: Set<string>): KanaChar {
  const fresh = pool.filter((k) => !recent.includes(k.id))
  const candidates = fresh.length > 0 ? fresh : pool
  const missed = candidates.filter((k) => missedIds.has(k.id))
  if (missed.length > 0 && Math.random() < 0.25) return sample(missed)
  return sample(candidates)
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * Four romaji choices (the answer + three from the pool, topped up from all
 * kana). `all` is the full chart, so a small unit (や row: 3 kana) still gets
 * four options; same-type kana are tried before basic ones.
 */
export function makeOptions(answer: KanaChar, pool: KanaChar[], all: KanaChar[]): string[] {
  const choices = new Set<string>([answer.romaji])
  const sameType = all.filter((k) => k.type === answer.type && !SKIPPED.has(k.id))
  for (const source of [shuffle(pool), shuffle(sameType), shuffle(all.filter((k) => k.type === 'basic'))]) {
    for (const k of source) {
      if (choices.size >= 4) break
      choices.add(k.romaji)
    }
  }
  return shuffle([...choices])
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
