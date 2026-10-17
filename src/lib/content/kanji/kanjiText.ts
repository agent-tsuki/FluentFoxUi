/**
 * Small pure helpers over the kanji data shapes (no data, no React).
 */
import type { KanjiCardFace, KanjiEntry, KanjiIndexRow, KanjiKunReading } from '@/types/kanji'

const KATAKANA_START = 0x30a1
const KATAKANA_END = 0x30f6
const KANA_OFFSET = 0x60

/** Katakana → hiragana (other characters unchanged): ニチ → にち. */
export function toHiragana(text: string): string {
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    out += code >= KATAKANA_START && code <= KATAKANA_END ? String.fromCodePoint(code - KANA_OFFSET) : ch
  }
  return out
}

/** Display form of a kun'yomi: た(べる), -び, こ-. */
export function kunLabel(kun: KanjiKunReading): string {
  const body = kun.okurigana ? `${kun.kana}(${kun.okurigana})` : kun.kana
  if (kun.affix === 'suffix') return `-${body}`
  if (kun.affix === 'prefix') return `${body}-`
  return body
}

/** Every reading of an entry: on'yomi (katakana) then kun'yomi stems (hiragana), de-duplicated. */
export function readingsOf(entry: Pick<KanjiEntry, 'on' | 'kun'>): string[] {
  return [...new Set([...entry.on, ...entry.kun.map((k) => k.kana)])]
}

/** SRS card id: `日:m` (meaning) / `日:r` (reading). Keyed by char, so progress is shared by every level. */
export function kanjiCardId(char: string, face: KanjiCardFace): string {
  return `${char}:${face === 'meaning' ? 'm' : 'r'}`
}

/** The index row of a full entry (mirrors index_row in scripts/kanji/build.py). */
export function indexRowOf(entry: KanjiEntry): KanjiIndexRow {
  return {
    char: entry.char,
    level: entry.jlpt,
    unitId: entry.unitId,
    meaning: entry.meanings[0] ?? '',
    meanings: [...new Set([...entry.meanings, ...(entry.synonyms ?? [])])],
    keyReading: entry.keyReading.kana,
    readings: readingsOf(entry),
    parts: entry.parts.map((p) => p.char),
    strokes: entry.strokes,
    ...(entry.freq !== undefined && { freq: entry.freq }),
  }
}
