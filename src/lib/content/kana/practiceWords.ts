/**
 * Everyday words for the hiragana "Word builder" practice mode.
 *
 * - Tier 1 (`basic`): written only with the 46 basic hiragana. No dakuten
 *   (゛/゜) and no small kana (ゃゅょっ), so a learner who knows the chart can
 *   build every word.
 * - Tier 2 (`dakuten`): may also use dakuten/han-dakuten kana (が, じ, ぶ, …),
 *   still with no small kana.
 *
 * `kana` is the word split into chart characters, in order; the practice
 * mode maps each character to its chart id through the kana list it receives,
 * so progress is recorded against the same ids the chart uses.
 * `picture` is an emoji used as the word's illustration (content, not UI icon).
 * Romaji is Hepburn with long vowels spelled out (e.g. "budou").
 */
export type PracticeWordTier = 'basic' | 'dakuten'

export interface PracticeWord {
  word: string
  /** The word's characters in order (each one is a chart character). */
  kana: string[]
  romaji: string
  meaning: string
  picture: string
  tier: PracticeWordTier
}

type Entry = [word: string, romaji: string, meaning: string, picture: string]

const BASIC: Entry[] = [
  ['すし', 'sushi', 'sushi', '🍣'],
  ['ねこ', 'neko', 'cat', '🐱'],
  ['さくら', 'sakura', 'cherry blossom', '🌸'],
  ['いぬ', 'inu', 'dog', '🐶'],
  ['うみ', 'umi', 'sea', '🌊'],
  ['やま', 'yama', 'mountain', '⛰️'],
  ['ゆき', 'yuki', 'snow', '❄️'],
  ['つき', 'tsuki', 'moon', '🌙'],
  ['とり', 'tori', 'bird', '🐦'],
  ['はな', 'hana', 'flower', '🌷'],
  ['ほし', 'hoshi', 'star', '⭐'],
  ['きつね', 'kitsune', 'fox', '🦊'],
  ['くも', 'kumo', 'cloud', '☁️'],
  ['さかな', 'sakana', 'fish', '🐟'],
  ['さる', 'saru', 'monkey', '🐒'],
  ['くま', 'kuma', 'bear', '🐻'],
  ['うし', 'ushi', 'cow', '🐄'],
  ['うま', 'uma', 'horse', '🐴'],
  ['かめ', 'kame', 'turtle', '🐢'],
  ['かに', 'kani', 'crab', '🦀'],
  ['たこ', 'tako', 'octopus', '🐙'],
  ['もも', 'momo', 'peach', '🍑'],
  ['くるま', 'kuruma', 'car', '🚗'],
  ['ふね', 'fune', 'boat', '⛵'],
  ['みみ', 'mimi', 'ear', '👂'],
  ['あめ', 'ame', 'rain', '🌧️'],
  ['かさ', 'kasa', 'umbrella', '☂️'],
  ['くつ', 'kutsu', 'shoes', '👟'],
  ['すいか', 'suika', 'watermelon', '🍉'],
  ['ひまわり', 'himawari', 'sunflower', '🌻'],
  ['かえる', 'kaeru', 'frog', '🐸'],
  ['わに', 'wani', 'crocodile', '🐊'],
  ['りす', 'risu', 'squirrel', '🐿️'],
  ['なす', 'nasu', 'eggplant', '🍆'],
  ['ほん', 'hon', 'book', '📚'],
  ['いえ', 'ie', 'house', '🏠'],
  ['くち', 'kuchi', 'mouth', '👄'],
  ['あり', 'ari', 'ant', '🐜'],
  ['はち', 'hachi', 'bee', '🐝'],
  ['いす', 'isu', 'chair', '🪑'],
]

const DAKUTEN: Entry[] = [
  ['りんご', 'ringo', 'apple', '🍎'],
  ['たまご', 'tamago', 'egg', '🥚'],
  ['いちご', 'ichigo', 'strawberry', '🍓'],
  ['ぶどう', 'budou', 'grapes', '🍇'],
  ['にじ', 'niji', 'rainbow', '🌈'],
  ['へび', 'hebi', 'snake', '🐍'],
  ['うさぎ', 'usagi', 'rabbit', '🐰'],
  ['ぞう', 'zou', 'elephant', '🐘'],
  ['えび', 'ebi', 'shrimp', '🦐'],
  ['ごはん', 'gohan', 'rice', '🍚'],
  ['かぎ', 'kagi', 'key', '🔑'],
  ['ねずみ', 'nezumi', 'mouse', '🐭'],
  ['ばら', 'bara', 'rose', '🌹'],
  ['はなび', 'hanabi', 'fireworks', '🎆'],
  ['くじら', 'kujira', 'whale', '🐋'],
  ['めがね', 'megane', 'glasses', '👓'],
  ['でんわ', 'denwa', 'telephone', '☎️'],
]

const toWord =
  (tier: PracticeWordTier) =>
  ([word, romaji, meaning, picture]: Entry): PracticeWord => ({
    word,
    kana: Array.from(word),
    romaji,
    meaning,
    picture,
    tier,
  })

export const PRACTICE_WORDS: PracticeWord[] = [...BASIC.map(toWord('basic')), ...DAKUTEN.map(toWord('dakuten'))]
