import type { KanaGroup, KanaUnit } from '@/lib/content/kana/courseTypes'

/**
 * The guided katakana path: the same 13 units as hiragana (same kana ids, so
 * a hiragana ↔ katakana match can pair by id), plus two katakana-only units
 * for the long-vowel mark, small ッ and the extended "foreign sound" combos.
 * Nothing is locked; this is only the recommended sequence.
 *
 * VIDEOS: set `youtubeId` / `videoCredit` exactly as in hiraganaUnits.ts.
 */
export const KATAKANA_UNITS: KanaUnit[] = [
  { id: 'a',  title: 'ア row', summary: 'The five vowels, now in sharp, straight strokes.', kanaIds: ['a', 'i', 'u', 'e', 'o'] },
  { id: 'ka', title: 'カ row', summary: 'K + vowel — カ and キ look a lot like か and き.', kanaIds: ['ka', 'ki', 'ku', 'ke', 'ko'] },
  { id: 'sa', title: 'サ row', summary: 'S sounds, and the first look-alike trap: シ vs ツ.', kanaIds: ['sa', 'shi', 'su', 'se', 'so'] },
  { id: 'ta', title: 'タ row', summary: 'T sounds with chi and tsu — watch タ vs ク.', kanaIds: ['ta', 'chi', 'tsu', 'te', 'to'] },
  { id: 'na', title: 'ナ row', summary: 'N sounds: simple shapes, few strokes.', kanaIds: ['na', 'ni', 'nu', 'ne', 'no'] },
  { id: 'ha', title: 'ハ row', summary: 'H sounds, plus fu — ヘ is the same as へ.', kanaIds: ['ha', 'hi', 'fu', 'he', 'ho'] },
  { id: 'ma', title: 'マ row', summary: 'M sounds: ma, mi, mu, me, mo.', kanaIds: ['ma', 'mi', 'mu', 'me', 'mo'] },
  { id: 'ya', title: 'ヤ row', summary: 'Only three: ya, yu, yo.', kanaIds: ['ya', 'yu', 'yo'] },
  { id: 'ra', title: 'ラ row', summary: 'The Japanese r — リ is almost り.', kanaIds: ['ra', 'ri', 'ru', 're', 'ro'] },
  { id: 'wa', title: 'ワ · ヲ · ン', summary: 'The last three — and ン vs ソ.', kanaIds: ['wa', 'wo', 'n'] },
  {
    id: 'dakuten',
    title: 'Dakuten & handakuten',
    summary: 'Two dots or a circle change the sound: カ → ガ, ハ → パ.',
    kanaIds: [
      'ga', 'gi', 'gu', 'ge', 'go', 'za', 'ji', 'zu', 'ze', 'zo',
      'da', 'dji', 'dzu', 'de', 'do', 'ba', 'bi', 'bu', 'be', 'bo',
      'pa', 'pi', 'pu', 'pe', 'po',
    ],
  },
  {
    id: 'combo-1',
    title: 'Combinations I',
    summary: 'Small ャュョ: キャ, シャ, チャ, ニャ, ヒャ, ミャ, リャ.',
    kanaIds: [
      'kya', 'kyu', 'kyo', 'sha', 'shu', 'sho', 'cha', 'chu', 'cho',
      'nya', 'nyu', 'nyo', 'hya', 'hyu', 'hyo', 'mya', 'myu', 'myo', 'rya', 'ryu', 'ryo',
    ],
  },
  {
    id: 'combo-2',
    title: 'Combinations II',
    summary: 'Voiced combinations: ギャ, ジャ, ビャ, ピャ.',
    kanaIds: ['gya', 'gyu', 'gyo', 'jya', 'jyu', 'jyo', 'bya', 'byu', 'byo', 'pya', 'pyu', 'pyo'],
  },
  {
    id: 'marks',
    title: 'Long vowels & small ッ',
    summary: 'ー stretches a vowel (コーヒー); small ッ adds a tiny pause (ベッド).',
    kanaIds: ['long', 'sokuon'],
  },
  {
    id: 'foreign',
    title: 'Foreign sounds',
    summary: 'Small vowels make new sounds for loanwords: ファ, ティ, ヴァ, シェ.',
    kanaIds: [
      'vu', 'ye', 'fa', 'fi', 'fe', 'fo', 'va', 'vi', 've', 'vo',
      'wi', 'we', 'who', 'fyu', 'ti', 'di', 'tu', 'du', 'tyu', 'dyu',
      'she', 'je', 'che', 'tsa', 'tse', 'tso',
    ],
  },
]

/** The four groups of units that can each be learned or skipped with a test. */
export const KATAKANA_GROUPS: KanaGroup[] = [
  {
    id: 'basic',
    title: 'Basic 46',
    summary: 'The core katakana, ア to ン.',
    unitIds: ['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa'],
  },
  { id: 'dakuten', title: 'Dakuten & handakuten', summary: 'Voiced sounds: カ → ガ, ハ → パ.', unitIds: ['dakuten'] },
  { id: 'combo', title: 'Combinations', summary: 'Small ャュョ combinations.', unitIds: ['combo-1', 'combo-2'] },
  {
    id: 'foreign',
    title: 'Foreign sounds',
    summary: 'ー, small ッ and the extra sounds used in loanwords.',
    unitIds: ['marks', 'foreign'],
  },
]

export const KATAKANA_CERTIFICATE_TITLE = 'FoxSensei Katakana Certificate'
