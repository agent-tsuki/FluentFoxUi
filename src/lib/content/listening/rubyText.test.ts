import { describe, expect, it } from 'vitest'
import { activeToken, kanaToRomaji, parseRubyLine, romajiLine } from './rubyText'

describe('parseRubyLine', () => {
  it('reads words, readings and punctuation', () => {
    const line = parseRubyLine('私[わたし] は 学生[がくせい] です。')
    expect(line.tokens.map((t) => t.written)).toEqual(['私', 'は', '学生', 'です', '。'])
    expect(line.tokens.map((t) => t.hiragana).join('')).toBe('わたしはがくせいです。')
    expect(line.spoken).toBe('私は学生です。')
    expect(line.sentences).toBe(1)
  })

  it('keeps okurigana outside the reading and handles several readings in one word', () => {
    const [word] = parseRubyLine('引[ひ]っ越[こ]し').tokens
    expect(word.parts).toEqual([{ text: '引', reading: 'ひ' }, { text: 'っ' }, { text: '越', reading: 'こ' }, { text: 'し' }])
    expect(word.written).toBe('引っ越し')
    expect(word.hiragana).toBe('ひっこし')
  })

  it('reads a digit and kanji run as one base', () => {
    const [time] = parseRubyLine('7時[しちじ] に').tokens
    expect(time.parts).toEqual([{ text: '7時', reading: 'しちじ' }])
  })

  it('folds katakana into hiragana', () => {
    expect(parseRubyLine('ラーメン が').tokens[0].hiragana).toBe('らーめん')
  })

  it('numbers the sentences the way the audio is split', () => {
    const line = parseRubyLine('はい。 そう です か。')
    expect(line.sentences).toBe(2)
    expect(line.tokens.map((t) => t.sentence)).toEqual([0, 0, 1, 1, 1, 1])
  })
})

describe('romaji', () => {
  it.each([
    ['がっこう', 'gakkou'],
    ['きって', 'kitte'],
    ['まっちゃ', 'matcha'],
    ['しゃしん', 'shashin'],
    ['きょう', 'kyou'],
    ['てんいん', "ten'in"],
    ['らーめん', 'raamen'],
    ['ふぁん', 'fan'],
  ])('%s -> %s', (kana, romaji) => {
    expect(kanaToRomaji(kana)).toBe(romaji)
  })

  it('says particles as they sound, spaces words and capitalises sentences', () => {
    const line = parseRubyLine('私[わたし] は 駅[えき] へ 本[ほん] を 読[よ]み に 行[い]きます。 日本[にほん] では？')
    expect(romajiLine(line.tokens)).toBe('Watashi wa eki e hon o yomi ni ikimasu. Nihon dewa?')
  })

  it('keeps a は inside a word as ha', () => {
    expect(romajiLine(parseRubyLine('はい、 母[はは] です。').tokens)).toBe('Hai, haha desu.')
  })
})

describe('activeToken', () => {
  const line = parseRubyLine('はい。 そう です か。')

  it('follows each clip within its own sentence', () => {
    expect(activeToken(line, 0, 2, 0)).toBe(0)
    expect(activeToken(line, 1, 2, 0)).toBe(2)
    expect(activeToken(line, 1, 2, 0.99)).toBe(5)
  })

  it('spreads progress over the line when the clips do not match its sentences', () => {
    expect(activeToken(line, 0, 1, 0)).toBe(0)
    expect(activeToken(line, 0, 1, 0.6)).toBe(3)
  })
})
