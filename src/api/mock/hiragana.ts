import type { KanaChar, KanaSection } from '@/types'

// ─── Basic Hiragana (46 + placeholders) ───────────────────────────────────────

const basic: KanaChar[] = [
  // A-O
  { id: 'a',   character: 'あ', romaji: 'a',   type: 'basic' },
  { id: 'i',   character: 'い', romaji: 'i',   type: 'basic' },
  { id: 'u',   character: 'う', romaji: 'u',   type: 'basic' },
  { id: 'e',   character: 'え', romaji: 'e',   type: 'basic' },
  { id: 'o',   character: 'お', romaji: 'o',   type: 'basic' },
  // KA-KO
  { id: 'ka',  character: 'か', romaji: 'ka',  type: 'basic' },
  { id: 'ki',  character: 'き', romaji: 'ki',  type: 'basic' },
  { id: 'ku',  character: 'く', romaji: 'ku',  type: 'basic' },
  { id: 'ke',  character: 'け', romaji: 'ke',  type: 'basic' },
  { id: 'ko',  character: 'こ', romaji: 'ko',  type: 'basic' },
  // SA-SO
  { id: 'sa',  character: 'さ', romaji: 'sa',  type: 'basic' },
  { id: 'shi', character: 'し', romaji: 'shi', type: 'basic' },
  { id: 'su',  character: 'す', romaji: 'su',  type: 'basic' },
  { id: 'se',  character: 'せ', romaji: 'se',  type: 'basic' },
  { id: 'so',  character: 'そ', romaji: 'so',  type: 'basic' },
  // TA-TO
  { id: 'ta',  character: 'た', romaji: 'ta',  type: 'basic' },
  { id: 'chi', character: 'ち', romaji: 'chi', type: 'basic' },
  { id: 'tsu', character: 'つ', romaji: 'tsu', type: 'basic' },
  { id: 'te',  character: 'て', romaji: 'te',  type: 'basic' },
  { id: 'to',  character: 'と', romaji: 'to',  type: 'basic' },
  // NA-NO
  { id: 'na',  character: 'な', romaji: 'na',  type: 'basic' },
  { id: 'ni',  character: 'に', romaji: 'ni',  type: 'basic' },
  { id: 'nu',  character: 'ぬ', romaji: 'nu',  type: 'basic' },
  { id: 'ne',  character: 'ね', romaji: 'ne',  type: 'basic' },
  { id: 'no',  character: 'の', romaji: 'no',  type: 'basic' },
  // HA-HO
  { id: 'ha',  character: 'は', romaji: 'ha',  type: 'basic' },
  { id: 'hi',  character: 'ひ', romaji: 'hi',  type: 'basic' },
  { id: 'fu',  character: 'ふ', romaji: 'fu',  type: 'basic' },
  { id: 'he',  character: 'へ', romaji: 'he',  type: 'basic' },
  { id: 'ho',  character: 'ほ', romaji: 'ho',  type: 'basic' },
  // MA-MO
  { id: 'ma',  character: 'ま', romaji: 'ma',  type: 'basic' },
  { id: 'mi',  character: 'み', romaji: 'mi',  type: 'basic' },
  { id: 'mu',  character: 'む', romaji: 'mu',  type: 'basic' },
  { id: 'me',  character: 'め', romaji: 'me',  type: 'basic' },
  { id: 'mo',  character: 'も', romaji: 'mo',  type: 'basic' },
  // YA-YO (with grid placeholders)
  { id: 'ya',  character: 'や', romaji: 'ya',  type: 'basic' },
  { id: '_ya1', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'yu',  character: 'ゆ', romaji: 'yu',  type: 'basic' },
  { id: '_ya2', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'yo',  character: 'よ', romaji: 'yo',  type: 'basic' },
  // RA-RO
  { id: 'ra',  character: 'ら', romaji: 'ra',  type: 'basic' },
  { id: 'ri',  character: 'り', romaji: 'ri',  type: 'basic' },
  { id: 'ru',  character: 'る', romaji: 'ru',  type: 'basic' },
  { id: 're',  character: 'れ', romaji: 're',  type: 'basic' },
  { id: 'ro',  character: 'ろ', romaji: 'ro',  type: 'basic' },
  // WA-N (with grid placeholders)
  { id: 'wa',  character: 'わ', romaji: 'wa',  type: 'basic' },
  { id: '_wa1', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'wo',  character: 'を', romaji: 'wo',  type: 'basic' },
  { id: '_wa2', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'n',   character: 'ん', romaji: 'n',   type: 'basic' },
]

// ─── Dakuten / Han-Dakuten ────────────────────────────────────────────────────

const dakuten: KanaChar[] = [
  // GA-GO
  { id: 'ga', character: 'が', romaji: 'ga',  type: 'dakuten' },
  { id: 'gi', character: 'ぎ', romaji: 'gi',  type: 'dakuten' },
  { id: 'gu', character: 'ぐ', romaji: 'gu',  type: 'dakuten' },
  { id: 'ge', character: 'げ', romaji: 'ge',  type: 'dakuten' },
  { id: 'go', character: 'ご', romaji: 'go',  type: 'dakuten' },
  // ZA-ZO
  { id: 'za', character: 'ざ', romaji: 'za',  type: 'dakuten' },
  { id: 'ji', character: 'じ', romaji: 'ji',  type: 'dakuten' },
  { id: 'zu', character: 'ず', romaji: 'zu',  type: 'dakuten' },
  { id: 'ze', character: 'ぜ', romaji: 'ze',  type: 'dakuten' },
  { id: 'zo', character: 'ぞ', romaji: 'zo',  type: 'dakuten' },
  // DA-DO
  { id: 'da',  character: 'だ', romaji: 'da',  type: 'dakuten' },
  { id: 'dji', character: 'ぢ', romaji: 'dji', type: 'dakuten' },
  { id: 'dzu', character: 'づ', romaji: 'dzu', type: 'dakuten' },
  { id: 'de',  character: 'で', romaji: 'de',  type: 'dakuten' },
  { id: 'do',  character: 'ど', romaji: 'do',  type: 'dakuten' },
  // BA-BO
  { id: 'ba', character: 'ば', romaji: 'ba',  type: 'dakuten' },
  { id: 'bi', character: 'び', romaji: 'bi',  type: 'dakuten' },
  { id: 'bu', character: 'ぶ', romaji: 'bu',  type: 'dakuten' },
  { id: 'be', character: 'べ', romaji: 'be',  type: 'dakuten' },
  { id: 'bo', character: 'ぼ', romaji: 'bo',  type: 'dakuten' },
  // PA-PO (han-dakuten)
  { id: 'pa', character: 'ぱ', romaji: 'pa',  type: 'dakuten' },
  { id: 'pi', character: 'ぴ', romaji: 'pi',  type: 'dakuten' },
  { id: 'pu', character: 'ぷ', romaji: 'pu',  type: 'dakuten' },
  { id: 'pe', character: 'ぺ', romaji: 'pe',  type: 'dakuten' },
  { id: 'po', character: 'ぽ', romaji: 'po',  type: 'dakuten' },
]

// ─── Combinations (Yōon) ─────────────────────────────────────────────────────

const compound: KanaChar[] = [
  // KY-
  { id: 'kya', character: 'きゃ', romaji: 'kya', type: 'compound', isCompound: true },
  { id: 'kyu', character: 'きゅ', romaji: 'kyu', type: 'compound', isCompound: true },
  { id: 'kyo', character: 'きょ', romaji: 'kyo', type: 'compound', isCompound: true },
  // SH-
  { id: 'sha', character: 'しゃ', romaji: 'sha', type: 'compound', isCompound: true },
  { id: 'shu', character: 'しゅ', romaji: 'shu', type: 'compound', isCompound: true },
  { id: 'sho', character: 'しょ', romaji: 'sho', type: 'compound', isCompound: true },
  // CH-
  { id: 'cha', character: 'ちゃ', romaji: 'cha', type: 'compound', isCompound: true },
  { id: 'chu', character: 'ちゅ', romaji: 'chu', type: 'compound', isCompound: true },
  { id: 'cho', character: 'ちょ', romaji: 'cho', type: 'compound', isCompound: true },
  // NY-
  { id: 'nya', character: 'にゃ', romaji: 'nya', type: 'compound', isCompound: true },
  { id: 'nyu', character: 'にゅ', romaji: 'nyu', type: 'compound', isCompound: true },
  { id: 'nyo', character: 'にょ', romaji: 'nyo', type: 'compound', isCompound: true },
  // HY-
  { id: 'hya', character: 'ひゃ', romaji: 'hya', type: 'compound', isCompound: true },
  { id: 'hyu', character: 'ひゅ', romaji: 'hyu', type: 'compound', isCompound: true },
  { id: 'hyo', character: 'ひょ', romaji: 'hyo', type: 'compound', isCompound: true },
  // MY-
  { id: 'mya', character: 'みゃ', romaji: 'mya', type: 'compound', isCompound: true },
  { id: 'myu', character: 'みゅ', romaji: 'myu', type: 'compound', isCompound: true },
  { id: 'myo', character: 'みょ', romaji: 'myo', type: 'compound', isCompound: true },
  // RY-
  { id: 'rya', character: 'りゃ', romaji: 'rya', type: 'compound', isCompound: true },
  { id: 'ryu', character: 'りゅ', romaji: 'ryu', type: 'compound', isCompound: true },
  { id: 'ryo', character: 'りょ', romaji: 'ryo', type: 'compound', isCompound: true },
  // GY-
  { id: 'gya', character: 'ぎゃ', romaji: 'gya', type: 'compound', isCompound: true },
  { id: 'gyu', character: 'ぎゅ', romaji: 'gyu', type: 'compound', isCompound: true },
  { id: 'gyo', character: 'ぎょ', romaji: 'gyo', type: 'compound', isCompound: true },
  // JY-
  { id: 'jya', character: 'じゃ', romaji: 'jya', type: 'compound', isCompound: true },
  { id: 'jyu', character: 'じゅ', romaji: 'jyu', type: 'compound', isCompound: true },
  { id: 'jyo', character: 'じょ', romaji: 'jyo', type: 'compound', isCompound: true },
  // BY-
  { id: 'bya', character: 'びゃ', romaji: 'bya', type: 'compound', isCompound: true },
  { id: 'byu', character: 'びゅ', romaji: 'byu', type: 'compound', isCompound: true },
  { id: 'byo', character: 'びょ', romaji: 'byo', type: 'compound', isCompound: true },
  // PY-
  { id: 'pya', character: 'ぴゃ', romaji: 'pya', type: 'compound', isCompound: true },
  { id: 'pyu', character: 'ぴゅ', romaji: 'pyu', type: 'compound', isCompound: true },
  { id: 'pyo', character: 'ぴょ', romaji: 'pyo', type: 'compound', isCompound: true },
]

// ─── Assembled sections ───────────────────────────────────────────────────────

export const mockHiraganaSections: KanaSection[] = [
  {
    id: 'basic',
    title: 'Basic Hiragana',
    accentColor: 'primary',
    columns: 5,
    chars: basic,
  },
  {
    id: 'dakuten',
    title: 'Dakuten / Han-Dakuten',
    accentColor: 'tertiary',
    columns: 5,
    chars: dakuten,
  },
  {
    id: 'compound',
    title: 'Combinations (Yōon)',
    accentColor: 'primary',
    columns: 3,
    chars: compound,
  },
]
