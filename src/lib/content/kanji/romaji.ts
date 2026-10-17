/**
 * Romaji → hiragana for typed reading answers (Hepburn, plus the common
 * Kunrei / wāpuro spellings). Kana typed with an IME passes through
 * unchanged; katakana is folded to hiragana by the caller (`toHiragana`).
 *
 * `n` before a consonant (or at the end) becomes ん; `nn` and `n'` always do.
 * A doubled consonant becomes っ (kka → っか).
 */

const TABLE: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
  sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
  ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
  da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
  pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  la: 'ら', li: 'り', lu: 'る', le: 'れ', lo: 'ろ',
  wa: 'わ', wo: 'を', we: 'うぇ', wi: 'うぃ',
  kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ', gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
  sha: 'しゃ', shu: 'しゅ', sho: 'しょ', sya: 'しゃ', syu: 'しゅ', syo: 'しょ',
  ja: 'じゃ', ju: 'じゅ', jo: 'じょ', jya: 'じゃ', jyu: 'じゅ', jyo: 'じょ', zya: 'じゃ', zyu: 'じゅ', zyo: 'じょ',
  cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', tya: 'ちゃ', tyu: 'ちゅ', tyo: 'ちょ', cya: 'ちゃ', cyu: 'ちゅ', cyo: 'ちょ',
  nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ', hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
  bya: 'びゃ', byu: 'びゅ', byo: 'びょ', pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
  mya: 'みゃ', myu: 'みゅ', myo: 'みょ', rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
  fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
  xtsu: 'っ', xtu: 'っ', ltu: 'っ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ',
  '-': 'ー',
}

const VOWELS = 'aeiou'
const MAX_KEY = 4

/**
 * Converts romaji to hiragana; characters that are already kana are kept.
 * While typing (`final: false`) a trailing lone "n" stays Latin, since it may
 * start な / に / … rather than be ん.
 */
export function romajiToHiragana(input: string, final = true): string {
  const s = input.toLowerCase()
  let out = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    // ん: nn, n', or n not followed by a vowel / y.
    if (ch === 'n') {
      const next = s[i + 1]
      if (next === 'n') {
        out += 'ん'
        i += 2
        continue
      }
      if (next === "'") {
        out += 'ん'
        i += 2
        continue
      }
      if (next === undefined && !final) {
        out += 'n'
        i += 1
        continue
      }
      if (next === undefined || (!VOWELS.includes(next) && next !== 'y')) {
        out += 'ん'
        i += 1
        continue
      }
    }
    // Doubled consonant (or Hepburn "tch") → っ.
    if ((ch >= 'a' && ch <= 'z' && !VOWELS.includes(ch) && ch !== 'n' && s[i + 1] === ch) || s.startsWith('tch', i)) {
      out += 'っ'
      i += 1
      continue
    }
    let matched = false
    for (let len = MAX_KEY; len > 0; len--) {
      const kana = TABLE[s.slice(i, i + len)]
      if (kana) {
        out += kana
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      out += ch
      i += 1
    }
  }
  return out
}

/** True while the text still holds unconverted Latin letters (an unfinished syllable). */
export function hasLatin(text: string): boolean {
  return /[a-z]/i.test(text)
}
