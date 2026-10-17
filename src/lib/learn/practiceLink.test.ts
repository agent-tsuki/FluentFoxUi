import { describe, expect, it } from 'vitest'
import { confusionPair, lookAlikeLink, practiceLink } from '@/lib/learn/practiceLink'
import type { PracticeSuggestion } from '@/types/progress'

describe('practiceLink', () => {
  const cases: { name: string; suggestion: PracticeSuggestion; want: string }[] = [
    { name: 'kana weak cards open the listening drill', suggestion: { track: 'hiragana', mode: 'weak' }, want: '/kana/hiragana/practice/listen' },
    { name: 'a kana unit keeps its slug', suggestion: { track: 'katakana', mode: 'unit', unit: 'ka' }, want: '/kana/katakana/practice/listen?unit=ka' },
    { name: 'a kana look-alike pair is passed on', suggestion: { track: 'hiragana', mode: 'lookalike', pair: 'ぬ:め' }, want: `/kana/hiragana/practice/lookalike?pair=${encodeURIComponent('ぬ:め')}` },
    { name: 'a slow kana opens the speed round', suggestion: { track: 'hiragana', mode: 'speed' }, want: '/kana/hiragana/practice/speed' },
    { name: 'kanji weak cards open meanings', suggestion: { track: 'kanji_n5', mode: 'weak' }, want: '/kanji/n5/practice/meaning' },
    { name: 'a kanji unit keeps its slug', suggestion: { track: 'kanji_n5', mode: 'unit', unit: 'u03' }, want: '/kanji/n5/practice/meaning?unit=u03' },
    { name: 'a kanji pair opens look-alikes', suggestion: { track: 'kanji_n5', mode: 'lookalike', pair: '日:目' }, want: `/kanji/n5/practice/lookalikes?pair=${encodeURIComponent('日:目')}` },
    { name: 'a slow kanji falls back to meanings', suggestion: { track: 'kanji_n5', mode: 'speed' }, want: '/kanji/n5/practice/meaning' },
    { name: 'a unit mode without a slug drops the query', suggestion: { track: 'hiragana', mode: 'unit' }, want: '/kana/hiragana/practice/listen' },
  ]
  for (const c of cases) {
    it(c.name, () => {
      expect(practiceLink(c.suggestion)).toBe(c.want)
    })
  }
})

describe('lookAlikeLink', () => {
  it('drills the asked character against the one picked', () => {
    expect(confusionPair('ぬ', 'め')).toBe('ぬ:め')
    expect(lookAlikeLink('hiragana', 'ぬ', 'め')).toBe(practiceLink({ track: 'hiragana', mode: 'lookalike', pair: 'ぬ:め' }))
  })
})
