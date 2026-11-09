import { describe, expect, it } from 'vitest'
import { romajiToHiragana } from '@/lib/content/kanji/romaji'
import { toHiragana } from '@/lib/content/kanji/kanjiText'
import { CHAPTER_VOCAB } from './chapterVocab'

/** Test helper: the vowel each hiragana ends in (for spelling out ー). */
function getVowelTable(): Map<string, string> {
  const rows: Record<string, string> = {
    あ: 'あかさたなはまやらわがざだばぱぁゃ',
    い: 'いきしちにひみりぎじぢびぴぃ',
    う: 'うくすつぬふむゆるぐずづぶぷぅゅ',
    え: 'えけせてねへめれげぜでべぺぇ',
    お: 'おこそとのほもよろをごぞどぼぽぉょ',
  }
  const table = new Map<string, string>()
  for (const [vowel, kana] of Object.entries(rows)) for (const k of kana) table.set(k, vowel)
  return table
}

/** Katakana → hiragana with ー spelled out as the vowel before it (コーヒー → こおひい). */
function spelled(kana: string): string {
  const vowelOf = getVowelTable()
  let out = ''
  for (const ch of toHiragana(kana)) out += ch === 'ー' ? (vowelOf.get(out.slice(-1)) ?? '') : ch
  return out
}

describe('chapter vocabulary', () => {
  for (const [level, chapters] of Object.entries(CHAPTER_VOCAB)) {
    for (const [chapter, words] of Object.entries(chapters)) {
      it(`${level} chapter ${chapter}: romaji matches kana, nothing missing`, () => {
        expect(words.length).toBeGreaterThan(10)
        for (const word of words) {
          expect(word.word.trim(), JSON.stringify(word)).not.toBe('')
          expect(word.meaning.trim(), word.word).not.toBe('')
          // The particle を is said "o"; Hepburn writes ティ as "ti" (the converter reads it as ち).
          const want = spelled(word.kana).replace(/を/g, 'お').replace(/てぃ/g, 'ち')
          // Hepburn "nn" before a vowel is ん + な行 (donna = どんな); the converter wants n'n.
          const hepburn = word.romaji.replace(/\s+/g, '').replace(/nn(?=[aiueoy])/g, "n'n")
          const got = romajiToHiragana(hepburn)
          expect(got, `${word.word}: ${word.romaji}`).toBe(want)
        }
      })
    }
  }
})
