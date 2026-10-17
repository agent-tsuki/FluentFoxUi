/**
 * Memory hints for every katakana chart character: the basic 46 use their own
 * mnemonic (katakanaMnemonics.ts); dakuten, yōon and foreign-sound combos get
 * a short explanation of how they are built; ー and small ッ explain the mark.
 */
import { KATAKANA_MNEMONICS } from '@/lib/content/kana/katakanaMnemonics'

/** Romaji of each basic katakana, so voiced and combined kana can name their base. */
const BASIC_ROMAJI: Record<string, string> = {
  ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o',
  カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko',
  サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so',
  タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
  ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no',
  ハ: 'ha', ヒ: 'hi', フ: 'fu', ヘ: 'he', ホ: 'ho',
  マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo',
  ヤ: 'ya', ユ: 'yu', ヨ: 'yo',
  ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro',
  ワ: 'wa', ヲ: 'wo', ン: 'n',
}

const DAKUTEN = '゙'
const HANDAKUTEN = '゚'
const SMALL_Y: Record<string, string> = { ャ: 'ya', ュ: 'yu', ョ: 'yo' }
const SMALL_VOWEL: Record<string, string> = { ァ: 'a', ィ: 'i', ゥ: 'u', ェ: 'e', ォ: 'o' }
const VOICED: Record<string, string> = { k: 'g', s: 'z', t: 'd', h: 'b' }

const MARK_HINTS: Record<string, string> = {
  ー: 'ー isn’t a sound of its own: it stretches the vowel before it to two beats. コ + ー = koo, so コーヒー is “koohii” (coffee). Mostly used in katakana.',
  ッ: 'Small ッ adds a tiny pause: hold the next consonant for an extra beat. ベッド is “bed-do” (beddo), not “betsudo”. Watch the size: big ツ is tsu.',
}

/** Romaji of any single katakana: basic, voiced (ガ → ga, パ → pa) or ヴ. */
function romajiOf(ch: string): string | undefined {
  if (ch === 'ヴ') return 'vu'
  const basic = BASIC_ROMAJI[ch]
  if (basic) return basic
  const [base, mark] = Array.from(ch.normalize('NFD'))
  const r = base ? BASIC_ROMAJI[base] : undefined
  if (!r || !mark) return undefined
  if (mark === HANDAKUTEN) return 'p' + r.slice(1)
  if (r === 'shi' || r === 'chi') return 'ji'
  if (r === 'tsu') return 'zu'
  if (r === 'fu') return 'bu'
  const voiced = VOICED[r[0] ?? '']
  return voiced ? voiced + r.slice(1) : undefined
}

function voicedHint(character: string, romaji: string): string | undefined {
  if (character === 'ヴ') {
    return 'ヴ is ウ with two dots: a “v” sound made for loanwords: u → vu. Many people say it just like ブ (bu).'
  }
  const [base, mark] = Array.from(character.normalize('NFD'))
  const baseRomaji = base ? BASIC_ROMAJI[base] : undefined
  if (!base || !baseRomaji) return undefined
  if (mark === HANDAKUTEN) {
    return `${character} is ${base} with a small circle: the sound pops into a “p”: ${baseRomaji} → ${romaji}.`
  }
  if (mark !== DAKUTEN) return undefined
  const rare =
    character === 'ヂ' || character === 'ヅ'
      ? ` It sounds like ${character === 'ヂ' ? 'ジ (ji)' : 'ズ (zu)'} and is rarely used.`
      : ''
  return `${character} is ${base} with two dots: the sound turns voiced: ${baseRomaji} → ${romaji}.${rare}`
}

/** The memory hint for any katakana chart character. */
export function katakanaMemoryHint(character: string, romaji: string): string | undefined {
  const mark = MARK_HINTS[character]
  if (mark) return mark
  const chars = Array.from(character)
  if (chars.length === 2) {
    const [head = '', small = ''] = chars
    const headRomaji = romajiOf(head) ?? head
    if (SMALL_Y[small]) {
      return `${head} plus a small ${small}: the small ${small} isn't its own beat, it glides into ${head}: ${headRomaji} + ${SMALL_Y[small]} → ${romaji}.`
    }
    if (SMALL_VOWEL[small]) {
      return `${head} plus a small ${small}: the small vowel replaces ${head}’s own, making a sound Japanese borrowed for loanwords: ${headRomaji} → ${romaji}. Said as one beat.`
    }
    return undefined
  }
  return KATAKANA_MNEMONICS[romaji] ?? voicedHint(character, romaji)
}
