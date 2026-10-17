import type { PracticeWord, PracticeWordTier } from '@/lib/content/kana/practiceWords'

/**
 * Everyday loanwords for the katakana "Word builder" practice mode. Same shape
 * as the hiragana PRACTICE_WORDS, plus one katakana-only tier:
 *
 * - `basic`: only the 46 basic katakana (no ゛/゜, no small kana, no ー).
 * - `dakuten`: may also use dakuten/han-dakuten (ガ, ビ, パ, …); still no small kana or ー.
 * - `extended`: may also use ー, small ッ, yōon (シャ) and foreign-sound combos (フォ, ティ).
 *
 * `kana` is the word split into chart characters: a base kana followed by a
 * small ァィゥェォャュョ is ONE chart character (フォ, シャ), while ー and ッ
 * are chart characters of their own. Romaji is Hepburn with long vowels spelled
 * out (コーヒー → "koohii"), matching practiceWords.ts.
 */
export type KatakanaWordTier = PracticeWordTier | 'extended'

/** A PracticeWord with the wider katakana tier; otherwise identical in shape. */
export interface KatakanaWord extends Omit<PracticeWord, 'tier'> {
  tier: KatakanaWordTier
}

type Entry = [word: string, romaji: string, meaning: string, picture: string]

const BASIC: Entry[] = [
  ['カメラ', 'kamera', 'camera', '📷'],
  ['ホテル', 'hoteru', 'hotel', '🏨'],
  ['トマト', 'tomato', 'tomato', '🍅'],
  ['メロン', 'meron', 'melon', '🍈'],
  ['レモン', 'remon', 'lemon', '🍋'],
  ['テニス', 'tenisu', 'tennis', '🎾'],
  ['ナイフ', 'naifu', 'knife', '🔪'],
  ['アイス', 'aisu', 'ice cream', '🍨'],
  ['ミルク', 'miruku', 'milk', '🥛'],
  ['ネクタイ', 'nekutai', 'necktie', '👔'],
  ['マスク', 'masuku', 'face mask', '😷'],
  ['テント', 'tento', 'tent', '⛺'],
  ['トイレ', 'toire', 'toilet', '🚽'],
  ['ワイン', 'wain', 'wine', '🍷'],
  ['クリスマス', 'kurisumasu', 'Christmas', '🎄'],
  ['ライオン', 'raion', 'lion', '🦁'],
  ['キウイ', 'kiui', 'kiwi fruit', '🥝'],
]

const DAKUTEN: Entry[] = [
  ['テレビ', 'terebi', 'TV', '📺'],
  ['パン', 'pan', 'bread', '🍞'],
  ['ピアノ', 'piano', 'piano', '🎹'],
  ['ラジオ', 'rajio', 'radio', '📻'],
  ['バナナ', 'banana', 'banana', '🍌'],
  ['ゴリラ', 'gorira', 'gorilla', '🦍'],
  ['ペンギン', 'pengin', 'penguin', '🐧'],
  ['パンダ', 'panda', 'panda', '🐼'],
  ['バス', 'basu', 'bus', '🚌'],
  ['ドア', 'doa', 'door', '🚪'],
  ['ピザ', 'piza', 'pizza', '🍕'],
  ['ズボン', 'zubon', 'trousers', '👖'],
  ['ランドセル', 'randoseru', 'school backpack', '🎒'],
  ['ボタン', 'botan', 'button', '🔘'],
]

const EXTENDED: Entry[] = [
  // ー (long vowels)
  ['コーヒー', 'koohii', 'coffee', '☕'],
  ['ケーキ', 'keeki', 'cake', '🍰'],
  ['ラーメン', 'raamen', 'ramen', '🍜'],
  ['タクシー', 'takushii', 'taxi', '🚕'],
  ['ノート', 'nooto', 'notebook', '📓'],
  ['スキー', 'sukii', 'skiing', '⛷️'],
  ['ギター', 'gitaa', 'guitar', '🎸'],
  ['ハンバーガー', 'hanbaagaa', 'hamburger', '🍔'],
  ['ビール', 'biiru', 'beer', '🍺'],
  ['スーパー', 'suupaa', 'supermarket', '🛒'],
  ['エレベーター', 'erebeetaa', 'elevator', '🛗'],
  ['プール', 'puuru', 'swimming pool', '🏊'],
  ['ゲーム', 'geemu', 'video game', '🎮'],
  ['チーズ', 'chiizu', 'cheese', '🧀'],
  // small ッ
  ['ベッド', 'beddo', 'bed', '🛏️'],
  ['ロケット', 'roketto', 'rocket', '🚀'],
  ['ヨット', 'yotto', 'yacht', '⛵'],
  ['サッカー', 'sakkaa', 'soccer', '⚽'],
  ['ホットドッグ', 'hottodoggu', 'hot dog', '🌭'],
  ['ネット', 'netto', 'internet', '🌐'],
  ['バッグ', 'baggu', 'bag', '👜'],
  ['カップ', 'kappu', 'cup', '🥤'],
  ['スリッパ', 'surippa', 'slippers', '🩴'],
  // yōon
  ['シャツ', 'shatsu', 'shirt', '👕'],
  ['ジュース', 'juusu', 'juice', '🧃'],
  ['ニュース', 'nyuusu', 'news', '📰'],
  ['チョコレート', 'chokoreeto', 'chocolate', '🍫'],
  ['コンピューター', 'konpyuutaa', 'computer', '💻'],
  ['キャンディー', 'kyandii', 'candy', '🍬'],
  ['アイスクリーム', 'aisukuriimu', 'ice cream', '🍦'],
  // foreign sounds
  ['フォーク', 'fooku', 'fork', '🍴'],
  ['ソファ', 'sofa', 'sofa', '🛋️'],
  ['パーティー', 'paatii', 'party', '🎉'],
  ['ディナー', 'dinaa', 'dinner', '🍽️'],
  ['シェフ', 'shefu', 'chef', '🧑‍🍳'],
  ['チェス', 'chesu', 'chess', '♟️'],
  ['ジェットコースター', 'jettokoosutaa', 'roller coaster', '🎢'],
  ['ハロウィン', 'harowin', 'Halloween', '🎃'],
  ['ヴァイオリン', 'vaiorin', 'violin', '🎻'],
  ['フィッシュ', 'fisshu', 'fish (dish)', '🐟'],
]

/** Small kana that combine with the kana before them into one chart character. */
const COMBINING_SMALL = new Set(Array.from('ァィゥェォャュョ'))

/** Splits a katakana word into chart characters (フォーク → フォ, ー, ク). */
export function splitKatakana(word: string): string[] {
  const out: string[] = []
  for (const ch of Array.from(word)) {
    if (COMBINING_SMALL.has(ch) && out.length > 0) out[out.length - 1] += ch
    else out.push(ch)
  }
  return out
}

const toWord =
  (tier: KatakanaWordTier) =>
  ([word, romaji, meaning, picture]: Entry): KatakanaWord => ({
    word,
    kana: splitKatakana(word),
    romaji,
    meaning,
    picture,
    tier,
  })

export const KATAKANA_WORDS: KatakanaWord[] = [
  ...BASIC.map(toWord('basic')),
  ...DAKUTEN.map(toWord('dakuten')),
  ...EXTENDED.map(toWord('extended')),
]
