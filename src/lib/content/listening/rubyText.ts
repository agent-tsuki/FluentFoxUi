/**
 * Listening text comes from the API written with its readings: words are
 * separated by spaces and every run of kanji (or digits) is followed by its
 * reading in brackets, e.g. "7時[しちじ] に 起[お]きます。". From that one
 * source this module derives each word as written, in hiragana and in romaji,
 * so the three scripts line up word by word (and the highlight can follow the
 * voice in any of them). Pure.
 */
import { toHiragana } from '@/lib/content/kanji/kanjiText'
import { sentences } from '@/lib/audio/speechText'

/** One piece of a word: kana as is, or a kanji run with its reading. */
export interface RubyPart {
  text: string
  reading?: string
}

export interface RubyToken {
  parts: RubyPart[]
  /** As normally written: kanji and kana. */
  written: string
  /** Hiragana only (katakana folded too). */
  hiragana: string
  romaji: string
  /** Punctuation: no highlight of its own, and no space before it in romaji. */
  punct: boolean
  /** Which sentence of the line it belongs to (one audio clip per sentence). */
  sentence: number
  /** About how long it takes to say, in kana. */
  weight: number
}

export interface RubyLine {
  tokens: RubyToken[]
  /** The text to speak: as written, without the spaces or readings. */
  spoken: string
  /** How many sentences (clips) the line has. */
  sentences: number
}

const BASE = /[\p{Script=Han}\p{N}]/u
const WORD = /[\p{L}\p{N}ー々[\]]/u
const SENTENCE_END = /[。！？!?]/

/** "起[お]きます" -> 起(お) + きます. */
function parseParts(word: string): RubyPart[] {
  const parts: RubyPart[] = []
  let plain = ''
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    if (ch !== '[') {
      plain += ch
      continue
    }
    const close = word.indexOf(']', i)
    const reading = close === -1 ? '' : word.slice(i + 1, close)
    // The reading covers the run of kanji/digits just before it.
    let start = plain.length
    while (start > 0 && BASE.test(plain[start - 1])) start--
    if (start < plain.length && reading) {
      if (start > 0) parts.push({ text: plain.slice(0, start) })
      parts.push({ text: plain.slice(start), reading })
    } else if (plain) {
      parts.push({ text: plain })
    }
    plain = ''
    i = close === -1 ? word.length : close
  }
  if (plain) parts.push({ text: plain })
  return parts
}

/** Splits a space-separated word into word and punctuation pieces: "です。" -> "です", "。". */
function pieces(word: string): { text: string; punct: boolean }[] {
  const out: { text: string; punct: boolean }[] = []
  for (const ch of word) {
    const punct = !WORD.test(ch)
    const last = out[out.length - 1]
    if (last && last.punct === punct && !punct) last.text += ch
    else out.push({ text: ch, punct })
  }
  return out
}

const PUNCT_ROMAJI: Record<string, string> = { '。': '.', '、': ',', '？': '?', '！': '!', '「': '“', '」': '”', '・': ' ', '…': '…' }

/** Particles said differently from how they are written. */
const PARTICLES: Record<string, string> = { は: 'wa', へ: 'e', を: 'o', では: 'dewa', には: 'niwa', とは: 'towa', からは: 'karawa', までは: 'madewa' }
const GREETINGS: Record<string, string> = { こんにちは: 'konnichiwa', こんばんは: 'konbanwa' }

const MONO: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko', が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so', ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to', だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho', ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo', や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro', わ: 'wa', を: 'o', ん: 'n',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o', ゔ: 'vu',
}
/** Two kana read as one sound: きゃ, しょ, ふぁ, てぃ… */
const DIGRAPHS: Record<string, string> = {
  しゃ: 'sha', しゅ: 'shu', しょ: 'sho', しぇ: 'she', じゃ: 'ja', じゅ: 'ju', じょ: 'jo', じぇ: 'je',
  ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho', ちぇ: 'che', ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo', てぃ: 'ti', でぃ: 'di', うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
}
const SMALL_Y: Record<string, string> = { ゃ: 'a', ゅ: 'u', ょ: 'o' }

/** Hiragana to romaji, the way the course spells it: gakkou, suupaa, ten'in. */
export function kanaToRomaji(kana: string): string {
  const syllables: string[] = []
  for (let i = 0; i < kana.length; i++) {
    const ch = kana[i]
    const pair = DIGRAPHS[kana.slice(i, i + 2)]
    if (pair) {
      syllables.push(pair)
      i++
      continue
    }
    const y = SMALL_Y[kana[i + 1]]
    if (y && MONO[ch] && MONO[ch].endsWith('i')) {
      syllables.push(MONO[ch].slice(0, -1) + 'y' + y)
      i++
      continue
    }
    if (ch === 'ー') {
      const last = syllables[syllables.length - 1] ?? ''
      syllables.push(last.slice(-1).match(/[aiueo]/) ? last.slice(-1) : '')
      continue
    }
    syllables.push(ch === 'っ' ? 'っ' : (MONO[ch] ?? ch))
  }
  let out = ''
  syllables.forEach((s, i) => {
    const next = syllables[i + 1] ?? ''
    if (s === 'っ') {
      // っ doubles the next consonant (ch → tch); at the end it is a glottal stop, not written.
      out += next.startsWith('ch') ? 't' : /^[a-z]/.test(next) && !/^[aiueon]/.test(next) ? next[0] : ''
    } else if (s === 'n' && /^[aiueoy]/.test(next)) {
      out += "n'"
    } else {
      out += s
    }
  })
  return out
}

function tokenRomaji(hiragana: string, punct: boolean, text: string): string {
  if (punct) return PUNCT_ROMAJI[text] ?? text
  return GREETINGS[hiragana] ?? PARTICLES[hiragana] ?? kanaToRomaji(hiragana)
}

/** About how many kana long a token is, for spreading a clip's time across its words. */
function weightOf(hiragana: string, punct: boolean, text: string): number {
  if (punct) return text === '、' ? 1 : 0.3
  return Math.max(1, hiragana.replace(/[ゃゅょぁぃぅぇぉ]/g, '').length)
}

/** Parses a line of listening text written with readings. */
export function parseRubyLine(markup: string): RubyLine {
  const tokens: RubyToken[] = []
  let sentence = 0
  for (const word of markup.split(/\s+/).filter(Boolean)) {
    for (const piece of pieces(word)) {
      const parts = piece.punct ? [{ text: piece.text }] : parseParts(piece.text)
      const written = parts.map((p) => p.text).join('')
      const hiragana = toHiragana(parts.map((p) => p.reading ?? p.text).join(''))
      tokens.push({
        parts,
        written,
        hiragana,
        romaji: tokenRomaji(hiragana, piece.punct, piece.text),
        punct: piece.punct,
        sentence,
        weight: weightOf(hiragana, piece.punct, piece.text),
      })
      if (piece.punct && SENTENCE_END.test(piece.text)) sentence++
    }
  }
  // Closing punctuation after the last sentence end doesn't start a new sentence.
  const count = Math.max(1, ...tokens.map((t) => t.sentence + (t.punct ? 0 : 1)))
  for (const t of tokens) t.sentence = Math.min(t.sentence, count - 1)
  return { tokens, spoken: tokens.map((t) => t.written).join(''), sentences: count }
}

/** The line in romaji, piece by piece (each with its token, for highlighting): words spaced, punctuation attached, sentences capitalised. */
export function romajiPieces(tokens: readonly RubyToken[]): { text: string; token: number }[] {
  const out: { text: string; token: number }[] = []
  let capital = true
  let last = ''
  tokens.forEach((t, token) => {
    if (t.punct) {
      out.push({ text: t.romaji, token })
      last = t.romaji
      if (SENTENCE_END.test(t.written)) capital = true
      return
    }
    const word = capital ? t.romaji.charAt(0).toUpperCase() + t.romaji.slice(1) : t.romaji
    out.push({ text: (out.length > 0 && last !== '“' ? ' ' : '') + word, token })
    last = word
    capital = false
  })
  return out
}

export function romajiLine(tokens: readonly RubyToken[]): string {
  return romajiPieces(tokens)
    .map((p) => p.text)
    .join('')
}

/**
 * The token being said, from playback progress: clip `part` of `parts`,
 * `fraction` of the way through it. When the clips match the line's
 * sentences (the API splits it the same way) each clip maps to its own
 * sentence; otherwise progress is spread over the whole line. -1 before the
 * first word.
 */
export function activeToken(line: RubyLine, part: number, parts: number, fraction: number): number {
  const sameSplit = parts === line.sentences && parts === sentences(line.spoken).length
  const inRange = sameSplit ? line.tokens.filter((t) => t.sentence === part) : line.tokens
  const progress = sameSplit ? fraction : (part + fraction) / Math.max(1, parts)
  const total = inRange.reduce((sum, t) => sum + t.weight, 0)
  let reached = progress * total
  for (const t of inRange) {
    reached -= t.weight
    if (reached < 0) return line.tokens.indexOf(t)
  }
  return line.tokens.indexOf(inRange[inRange.length - 1])
}
