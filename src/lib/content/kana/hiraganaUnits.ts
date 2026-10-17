/**
 * The guided hiragana path: 13 units in suggested order. Nothing is locked;
 * this is only the recommended sequence.
 *
 * VIDEOS: set `youtubeId` (the part after `v=` in a YouTube link, e.g.
 * "dQw4w9WgXcQ") once the creator has agreed, or your own upload. Units without
 * one simply hide the "Watch" step. Add `videoCredit` for third-party videos.
 */
import type { KanaGroup, KanaGroupId, KanaSkipScope, KanaUnit } from '@/lib/content/kana/courseTypes'

/** Kept for existing imports; the engine uses KanaUnit. */
export type HiraganaUnit = KanaUnit

export const HIRAGANA_UNITS: HiraganaUnit[] = [
  { id: 'a',  title: 'あ row', summary: 'The five vowels every other sound is built on.', kanaIds: ['a', 'i', 'u', 'e', 'o'] },
  { id: 'ka', title: 'か row', summary: 'K + vowel: ka, ki, ku, ke, ko.', kanaIds: ['ka', 'ki', 'ku', 'ke', 'ko'] },
  { id: 'sa', title: 'さ row', summary: 'S sounds — and the odd one out, shi.', kanaIds: ['sa', 'shi', 'su', 'se', 'so'] },
  { id: 'ta', title: 'た row', summary: 'T sounds, with chi and tsu.', kanaIds: ['ta', 'chi', 'tsu', 'te', 'to'] },
  { id: 'na', title: 'な row', summary: 'N sounds: na, ni, nu, ne, no.', kanaIds: ['na', 'ni', 'nu', 'ne', 'no'] },
  { id: 'ha', title: 'は row', summary: 'H sounds, plus the soft fu.', kanaIds: ['ha', 'hi', 'fu', 'he', 'ho'] },
  { id: 'ma', title: 'ま row', summary: 'M sounds: ma, mi, mu, me, mo.', kanaIds: ['ma', 'mi', 'mu', 'me', 'mo'] },
  { id: 'ya', title: 'や row', summary: 'Only three: ya, yu, yo.', kanaIds: ['ya', 'yu', 'yo'] },
  { id: 'ra', title: 'ら row', summary: 'The Japanese r — between r, l and d.', kanaIds: ['ra', 'ri', 'ru', 're', 'ro'] },
  { id: 'wa', title: 'わ · を · ん', summary: 'The last three: wa, wo and the lone n.', kanaIds: ['wa', 'wo', 'n'] },
  {
    id: 'dakuten',
    title: 'Dakuten & handakuten',
    summary: 'Two dots or a circle change the sound: か → が, は → ぱ.',
    kanaIds: [
      'ga', 'gi', 'gu', 'ge', 'go', 'za', 'ji', 'zu', 'ze', 'zo',
      'da', 'dji', 'dzu', 'de', 'do', 'ba', 'bi', 'bu', 'be', 'bo',
      'pa', 'pi', 'pu', 'pe', 'po',
    ],
  },
  {
    id: 'combo-1',
    title: 'Combinations I',
    summary: 'Small ゃゅょ: きゃ, しゃ, ちゃ, にゃ, ひゃ, みゃ, りゃ.',
    kanaIds: [
      'kya', 'kyu', 'kyo', 'sha', 'shu', 'sho', 'cha', 'chu', 'cho',
      'nya', 'nyu', 'nyo', 'hya', 'hyu', 'hyo', 'mya', 'myu', 'myo', 'rya', 'ryu', 'ryo',
    ],
  },
  {
    id: 'combo-2',
    title: 'Combinations II',
    summary: 'Voiced combinations: ぎゃ, じゃ, びゃ, ぴゃ.',
    kanaIds: ['gya', 'gyu', 'gyo', 'jya', 'jyu', 'jyo', 'bya', 'byu', 'byo', 'pya', 'pyu', 'pyo'],
  },
]

export const PASS_MARK = 0.8

export const CERTIFICATE_TITLE = 'FoxSensei Hiragana Certificate'

/** Pass mark per unit in a skip ("test out") test — stricter than PASS_MARK. */
export const SKIP_PASS_MARK = 0.9

/** Kept for existing imports; hiragana uses three of the KanaGroupIds (no 'foreign'). */
export type HiraganaGroupId = Exclude<KanaGroupId, 'foreign'>
/** What a skip test covers: one group, or the whole hiragana path. */
export type SkipScope = KanaSkipScope

export type HiraganaGroup = KanaGroup

/** The three groups of units that can each be learned or skipped with a test. */
export const HIRAGANA_GROUPS: HiraganaGroup[] = [
  {
    id: 'basic',
    title: 'Basic 46',
    summary: 'The core hiragana, あ to ん.',
    unitIds: ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'],
  },
  { id: 'dakuten', title: 'Dakuten & handakuten', summary: 'Voiced sounds: か → が, は → ぱ.', unitIds: ['dakuten'] },
  { id: 'combo', title: 'Combinations', summary: 'Small ゃゅょ combinations.', unitIds: ['combo-1', 'combo-2'] },
]

export const SKIP_SCOPES: KanaSkipScope[] = ['all', 'basic', 'dakuten', 'combo']

/** Units covered by a skip scope, in path order. */
export function unitsForScope(scope: KanaSkipScope): KanaUnit[] {
  if (scope === 'all') return HIRAGANA_UNITS
  const ids = HIRAGANA_GROUPS.find((g) => g.id === scope)?.unitIds ?? []
  return HIRAGANA_UNITS.filter((u) => ids.includes(u.id))
}
