import type { KanjiEntry } from '@/types/kanji'
import { shuffle } from '@/lib/pdf/shared'
import { readingsOf, kunLabel } from '@/lib/content/kanji/kanjiText'
import type { KanjiAnswerMode, KanjiQuestion, KanjiQuestionKind } from './types'
import { normaliseMeaning, normaliseReading } from './markKanjiAnswer'

const OPTION_COUNT = 4

/** The key reading as shown: katakana on'yomi, hiragana kun'yomi with okurigana. */
export function keyReadingLabel(entry: KanjiEntry): string {
  if (entry.keyReading.type === 'on') return entry.keyReading.kana
  const kun = entry.kun.find((k) => k.kana === entry.keyReading.kana && !k.affix) ?? entry.kun.find((k) => k.kana === entry.keyReading.kana)
  return kun ? kunLabel(kun).replace(/[()]/g, '') : entry.keyReading.kana
}

/** Every reading a typed answer may give, normalised to hiragana (stems and full forms). */
export function acceptedReadings(entry: KanjiEntry): string[] {
  const out = new Set<string>()
  for (const r of readingsOf(entry)) out.add(normaliseReading(r))
  for (const k of entry.kun) if (k.okurigana) out.add(normaliseReading(k.kana + k.okurigana))
  return [...out]
}

export function acceptedMeanings(entry: KanjiEntry): string[] {
  return [...new Set([...entry.meanings, ...(entry.synonyms ?? [])].map(normaliseMeaning).filter(Boolean))]
}

/** Up to `n` distinct labels from the pool, excluding `exclude` (normalised compare). */
function distractors(pool: readonly string[], exclude: (label: string) => boolean, n: number): string[] {
  const picked: string[] = []
  for (const label of shuffle(pool)) {
    if (picked.length >= n) break
    if (!exclude(label) && !picked.includes(label)) picked.push(label)
  }
  return picked
}

/**
 * One question about `target`. `pool` supplies distractors (ideally the same
 * level, so options look alike in difficulty).
 */
export function buildKanjiQuestion(
  target: KanjiEntry,
  kind: KanjiQuestionKind,
  pool: readonly KanjiEntry[],
  mode: KanjiAnswerMode,
  key: string,
): KanjiQuestion {
  const others = pool.filter((e) => e.char !== target.char)
  const face = kind === 'reading' ? 'reading' : 'meaning'
  const answerKind: KanjiAnswerMode = kind === 'meaning' || kind === 'reading' ? mode : 'choice'

  if (kind === 'reading') {
    const answer = keyReadingLabel(target)
    const accepted = acceptedReadings(target)
    const wrong = distractors(others.map(keyReadingLabel), (l) => accepted.includes(normaliseReading(l)), OPTION_COUNT - 1)
    return { key, kind, target, face, answerKind, answer, accepted, options: shuffle([answer, ...wrong]) }
  }

  if (kind === 'meaning') {
    const answer = target.meanings[0]
    const accepted = acceptedMeanings(target)
    const wrong = distractors(others.map((e) => e.meanings[0]), (l) => accepted.includes(normaliseMeaning(l)), OPTION_COUNT - 1)
    return { key, kind, target, face, answerKind, answer, accepted, options: shuffle([answer, ...wrong]) }
  }

  // kanji / listen: pick the character. Look-alikes first, so the choice is a real test.
  const lookAlikes = (target.lookAlikes ?? []).map((l) => l.char).filter((c) => others.some((e) => e.char === c))
  const rest = distractors(
    others.map((e) => e.char),
    (c) => lookAlikes.includes(c),
    OPTION_COUNT - 1 - Math.min(lookAlikes.length, 2),
  )
  const wrong = [...lookAlikes.slice(0, 2), ...rest].slice(0, OPTION_COUNT - 1)
  return { key, kind, target, face, answerKind: 'choice', answer: target.char, accepted: [target.char], options: shuffle([target.char, ...wrong]) }
}

/**
 * A meaning + reading pair for each target (the two SRS cards), shuffled so the
 * pair is not back to back when possible.
 */
export function buildMeaningReadingQuiz(targets: readonly KanjiEntry[], pool: readonly KanjiEntry[], mode: KanjiAnswerMode): KanjiQuestion[] {
  const questions = targets.flatMap((t, i) => [
    buildKanjiQuestion(t, 'meaning', pool, mode, `${t.char}-m-${i}`),
    buildKanjiQuestion(t, 'reading', pool, mode, `${t.char}-r-${i}`),
  ])
  return spreadPairs(shuffle(questions))
}

/** Reorders so the same kanji rarely appears twice in a row. */
function spreadPairs(questions: KanjiQuestion[]): KanjiQuestion[] {
  const out: KanjiQuestion[] = []
  const rest = [...questions]
  while (rest.length) {
    const prev = out[out.length - 1]?.target.char
    const i = rest.findIndex((q) => q.target.char !== prev)
    out.push(...rest.splice(i === -1 ? 0 : i, 1))
  }
  return out
}
