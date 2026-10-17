import type { KanaChar, KanaSection } from '@/types'

// ─── Basic Katakana (46 + placeholders) ───────────────────────────────────────

const basic: KanaChar[] = [
  // A-O
  { id: 'a',   character: 'ア', romaji: 'a',   type: 'basic' },
  { id: 'i',   character: 'イ', romaji: 'i',   type: 'basic' },
  { id: 'u',   character: 'ウ', romaji: 'u',   type: 'basic' },
  { id: 'e',   character: 'エ', romaji: 'e',   type: 'basic' },
  { id: 'o',   character: 'オ', romaji: 'o',   type: 'basic' },
  // KA-KO
  { id: 'ka',  character: 'カ', romaji: 'ka',  type: 'basic' },
  { id: 'ki',  character: 'キ', romaji: 'ki',  type: 'basic' },
  { id: 'ku',  character: 'ク', romaji: 'ku',  type: 'basic' },
  { id: 'ke',  character: 'ケ', romaji: 'ke',  type: 'basic' },
  { id: 'ko',  character: 'コ', romaji: 'ko',  type: 'basic' },
  // SA-SO
  { id: 'sa',  character: 'サ', romaji: 'sa',  type: 'basic' },
  { id: 'shi', character: 'シ', romaji: 'shi', type: 'basic' },
  { id: 'su',  character: 'ス', romaji: 'su',  type: 'basic' },
  { id: 'se',  character: 'セ', romaji: 'se',  type: 'basic' },
  { id: 'so',  character: 'ソ', romaji: 'so',  type: 'basic' },
  // TA-TO
  { id: 'ta',  character: 'タ', romaji: 'ta',  type: 'basic' },
  { id: 'chi', character: 'チ', romaji: 'chi', type: 'basic' },
  { id: 'tsu', character: 'ツ', romaji: 'tsu', type: 'basic' },
  { id: 'te',  character: 'テ', romaji: 'te',  type: 'basic' },
  { id: 'to',  character: 'ト', romaji: 'to',  type: 'basic' },
  // NA-NO
  { id: 'na',  character: 'ナ', romaji: 'na',  type: 'basic' },
  { id: 'ni',  character: 'ニ', romaji: 'ni',  type: 'basic' },
  { id: 'nu',  character: 'ヌ', romaji: 'nu',  type: 'basic' },
  { id: 'ne',  character: 'ネ', romaji: 'ne',  type: 'basic' },
  { id: 'no',  character: 'ノ', romaji: 'no',  type: 'basic' },
  // HA-HO
  { id: 'ha',  character: 'ハ', romaji: 'ha',  type: 'basic' },
  { id: 'hi',  character: 'ヒ', romaji: 'hi',  type: 'basic' },
  { id: 'fu',  character: 'フ', romaji: 'fu',  type: 'basic' },
  { id: 'he',  character: 'ヘ', romaji: 'he',  type: 'basic' },
  { id: 'ho',  character: 'ホ', romaji: 'ho',  type: 'basic' },
  // MA-MO
  { id: 'ma',  character: 'マ', romaji: 'ma',  type: 'basic' },
  { id: 'mi',  character: 'ミ', romaji: 'mi',  type: 'basic' },
  { id: 'mu',  character: 'ム', romaji: 'mu',  type: 'basic' },
  { id: 'me',  character: 'メ', romaji: 'me',  type: 'basic' },
  { id: 'mo',  character: 'モ', romaji: 'mo',  type: 'basic' },
  // YA-YO (with grid placeholders)
  { id: 'ya',  character: 'ヤ', romaji: 'ya',  type: 'basic' },
  { id: '_ya1', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'yu',  character: 'ユ', romaji: 'yu',  type: 'basic' },
  { id: '_ya2', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'yo',  character: 'ヨ', romaji: 'yo',  type: 'basic' },
  // RA-RO
  { id: 'ra',  character: 'ラ', romaji: 'ra',  type: 'basic' },
  { id: 'ri',  character: 'リ', romaji: 'ri',  type: 'basic' },
  { id: 'ru',  character: 'ル', romaji: 'ru',  type: 'basic' },
  { id: 're',  character: 'レ', romaji: 're',  type: 'basic' },
  { id: 'ro',  character: 'ロ', romaji: 'ro',  type: 'basic' },
  // WA row: ワ sits in the "a" column and ヲ in the "o" column; ン stands alone.
  { id: 'wa',  character: 'ワ', romaji: 'wa',  type: 'basic' },
  { id: '_wa1', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: '_wa2', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: '_wa3', character: '', romaji: '', type: 'basic', isEmpty: true },
  { id: 'wo',  character: 'ヲ', romaji: 'wo',  type: 'basic' },
  { id: 'n',   character: 'ン', romaji: 'n',   type: 'basic' },
]

// ─── Dakuten / Han-Dakuten ────────────────────────────────────────────────────

const dakuten: KanaChar[] = [
  // GA-GO
  { id: 'ga', character: 'ガ', romaji: 'ga',  type: 'dakuten' },
  { id: 'gi', character: 'ギ', romaji: 'gi',  type: 'dakuten' },
  { id: 'gu', character: 'グ', romaji: 'gu',  type: 'dakuten' },
  { id: 'ge', character: 'ゲ', romaji: 'ge',  type: 'dakuten' },
  { id: 'go', character: 'ゴ', romaji: 'go',  type: 'dakuten' },
  // ZA-ZO
  { id: 'za', character: 'ザ', romaji: 'za',  type: 'dakuten' },
  { id: 'ji', character: 'ジ', romaji: 'ji',  type: 'dakuten' },
  { id: 'zu', character: 'ズ', romaji: 'zu',  type: 'dakuten' },
  { id: 'ze', character: 'ゼ', romaji: 'ze',  type: 'dakuten' },
  { id: 'zo', character: 'ゾ', romaji: 'zo',  type: 'dakuten' },
  // DA-DO
  { id: 'da',  character: 'ダ', romaji: 'da',  type: 'dakuten' },
  { id: 'dji', character: 'ヂ', romaji: 'dji', type: 'dakuten' },
  { id: 'dzu', character: 'ヅ', romaji: 'dzu', type: 'dakuten' },
  { id: 'de',  character: 'デ', romaji: 'de',  type: 'dakuten' },
  { id: 'do',  character: 'ド', romaji: 'do',  type: 'dakuten' },
  // BA-BO
  { id: 'ba', character: 'バ', romaji: 'ba',  type: 'dakuten' },
  { id: 'bi', character: 'ビ', romaji: 'bi',  type: 'dakuten' },
  { id: 'bu', character: 'ブ', romaji: 'bu',  type: 'dakuten' },
  { id: 'be', character: 'ベ', romaji: 'be',  type: 'dakuten' },
  { id: 'bo', character: 'ボ', romaji: 'bo',  type: 'dakuten' },
  // PA-PO (han-dakuten)
  { id: 'pa', character: 'パ', romaji: 'pa',  type: 'dakuten' },
  { id: 'pi', character: 'ピ', romaji: 'pi',  type: 'dakuten' },
  { id: 'pu', character: 'プ', romaji: 'pu',  type: 'dakuten' },
  { id: 'pe', character: 'ペ', romaji: 'pe',  type: 'dakuten' },
  { id: 'po', character: 'ポ', romaji: 'po',  type: 'dakuten' },
]

// ─── Combinations (Yōon) ─────────────────────────────────────────────────────

const compound: KanaChar[] = [
  // KY-
  { id: 'kya', character: 'キャ', romaji: 'kya', type: 'compound', isCompound: true },
  { id: 'kyu', character: 'キュ', romaji: 'kyu', type: 'compound', isCompound: true },
  { id: 'kyo', character: 'キョ', romaji: 'kyo', type: 'compound', isCompound: true },
  // SH-
  { id: 'sha', character: 'シャ', romaji: 'sha', type: 'compound', isCompound: true },
  { id: 'shu', character: 'シュ', romaji: 'shu', type: 'compound', isCompound: true },
  { id: 'sho', character: 'ショ', romaji: 'sho', type: 'compound', isCompound: true },
  // CH-
  { id: 'cha', character: 'チャ', romaji: 'cha', type: 'compound', isCompound: true },
  { id: 'chu', character: 'チュ', romaji: 'chu', type: 'compound', isCompound: true },
  { id: 'cho', character: 'チョ', romaji: 'cho', type: 'compound', isCompound: true },
  // NY-
  { id: 'nya', character: 'ニャ', romaji: 'nya', type: 'compound', isCompound: true },
  { id: 'nyu', character: 'ニュ', romaji: 'nyu', type: 'compound', isCompound: true },
  { id: 'nyo', character: 'ニョ', romaji: 'nyo', type: 'compound', isCompound: true },
  // HY-
  { id: 'hya', character: 'ヒャ', romaji: 'hya', type: 'compound', isCompound: true },
  { id: 'hyu', character: 'ヒュ', romaji: 'hyu', type: 'compound', isCompound: true },
  { id: 'hyo', character: 'ヒョ', romaji: 'hyo', type: 'compound', isCompound: true },
  // MY-
  { id: 'mya', character: 'ミャ', romaji: 'mya', type: 'compound', isCompound: true },
  { id: 'myu', character: 'ミュ', romaji: 'myu', type: 'compound', isCompound: true },
  { id: 'myo', character: 'ミョ', romaji: 'myo', type: 'compound', isCompound: true },
  // RY-
  { id: 'rya', character: 'リャ', romaji: 'rya', type: 'compound', isCompound: true },
  { id: 'ryu', character: 'リュ', romaji: 'ryu', type: 'compound', isCompound: true },
  { id: 'ryo', character: 'リョ', romaji: 'ryo', type: 'compound', isCompound: true },
  // GY-
  { id: 'gya', character: 'ギャ', romaji: 'gya', type: 'compound', isCompound: true },
  { id: 'gyu', character: 'ギュ', romaji: 'gyu', type: 'compound', isCompound: true },
  { id: 'gyo', character: 'ギョ', romaji: 'gyo', type: 'compound', isCompound: true },
  // JY-
  { id: 'jya', character: 'ジャ', romaji: 'jya', type: 'compound', isCompound: true },
  { id: 'jyu', character: 'ジュ', romaji: 'jyu', type: 'compound', isCompound: true },
  { id: 'jyo', character: 'ジョ', romaji: 'jyo', type: 'compound', isCompound: true },
  // BY-
  { id: 'bya', character: 'ビャ', romaji: 'bya', type: 'compound', isCompound: true },
  { id: 'byu', character: 'ビュ', romaji: 'byu', type: 'compound', isCompound: true },
  { id: 'byo', character: 'ビョ', romaji: 'byo', type: 'compound', isCompound: true },
  // PY-
  { id: 'pya', character: 'ピャ', romaji: 'pya', type: 'compound', isCompound: true },
  { id: 'pyu', character: 'ピュ', romaji: 'pyu', type: 'compound', isCompound: true },
  { id: 'pyo', character: 'ピョ', romaji: 'pyo', type: 'compound', isCompound: true },
]

// ─── Foreign sounds (extended katakana for loanwords) ─────────────────────────
// Not in the hiragana chart. ー (long-vowel mark) and small ッ (pause before a
// doubled consonant) have no sound of their own, so their romaji is a label:
// '-' for ー and '(pause)' for ッ. ウォ uses id/romaji 'who' so it never
// collides with ヲ ('wo'), the same way ヂ uses 'dji' to stay distinct from ジ.

const foreign: KanaChar[] = [
  // Marks + single glyphs
  { id: 'long',   character: 'ー',   romaji: '-',       type: 'foreign' },
  { id: 'sokuon', character: 'ッ',   romaji: '(pause)', type: 'foreign' },
  { id: 'vu',     character: 'ヴ',   romaji: 'vu',      type: 'foreign' },
  { id: 'ye',     character: 'イェ', romaji: 'ye',      type: 'foreign', isCompound: true },
  // F-
  { id: 'fa',  character: 'ファ', romaji: 'fa',  type: 'foreign', isCompound: true },
  { id: 'fi',  character: 'フィ', romaji: 'fi',  type: 'foreign', isCompound: true },
  { id: 'fe',  character: 'フェ', romaji: 'fe',  type: 'foreign', isCompound: true },
  { id: 'fo',  character: 'フォ', romaji: 'fo',  type: 'foreign', isCompound: true },
  // V-
  { id: 'va',  character: 'ヴァ', romaji: 'va',  type: 'foreign', isCompound: true },
  { id: 'vi',  character: 'ヴィ', romaji: 'vi',  type: 'foreign', isCompound: true },
  { id: 've',  character: 'ヴェ', romaji: 've',  type: 'foreign', isCompound: true },
  { id: 'vo',  character: 'ヴォ', romaji: 'vo',  type: 'foreign', isCompound: true },
  // W- and FY-
  { id: 'wi',  character: 'ウィ', romaji: 'wi',  type: 'foreign', isCompound: true },
  { id: 'we',  character: 'ウェ', romaji: 'we',  type: 'foreign', isCompound: true },
  { id: 'who', character: 'ウォ', romaji: 'who', type: 'foreign', isCompound: true },
  { id: 'fyu', character: 'フュ', romaji: 'fyu', type: 'foreign', isCompound: true },
  // T- / D-
  { id: 'ti',  character: 'ティ', romaji: 'ti',  type: 'foreign', isCompound: true },
  { id: 'di',  character: 'ディ', romaji: 'di',  type: 'foreign', isCompound: true },
  { id: 'tu',  character: 'トゥ', romaji: 'tu',  type: 'foreign', isCompound: true },
  { id: 'du',  character: 'ドゥ', romaji: 'du',  type: 'foreign', isCompound: true },
  // TY- / DY- / SH- / J-
  { id: 'tyu', character: 'テュ', romaji: 'tyu', type: 'foreign', isCompound: true },
  { id: 'dyu', character: 'デュ', romaji: 'dyu', type: 'foreign', isCompound: true },
  { id: 'she', character: 'シェ', romaji: 'she', type: 'foreign', isCompound: true },
  { id: 'je',  character: 'ジェ', romaji: 'je',  type: 'foreign', isCompound: true },
  // CH- / TS-
  { id: 'che', character: 'チェ', romaji: 'che', type: 'foreign', isCompound: true },
  { id: 'tsa', character: 'ツァ', romaji: 'tsa', type: 'foreign', isCompound: true },
  { id: 'tse', character: 'ツェ', romaji: 'tse', type: 'foreign', isCompound: true },
  { id: 'tso', character: 'ツォ', romaji: 'tso', type: 'foreign', isCompound: true },
]

// ─── Assembled sections ───────────────────────────────────────────────────────

export const mockKatakanaSections: KanaSection[] = [
  {
    id: 'basic',
    title: 'Basic Katakana',
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
  {
    id: 'foreign',
    title: 'Foreign sounds',
    accentColor: 'tertiary',
    columns: 4,
    chars: foreign,
  },
]
