/**
 * Phase-0 FIXTURE: 12 real N5 kanji in two units, so the course UI can be
 * built before the generated data (src/lib/content/kanji/generated/*) lands.
 * Readings and vocab are correct; frequency ranks are KANJIDIC2's; mnemonics
 * are drafts. No stroke data: `kanjiService.getStrokes` returns null for these
 * until the KanjiVG files exist.
 *
 * Agent A: once generated N5/N4 data exists, point the loaders in
 * levelConfigs.ts at it. Keep this file for tests/storybook-style use or delete it.
 */
import type { KanjiEntry, KanjiGroup, KanjiLevelDetail, KanjiLevelIndex, KanjiUnit } from '@/types/kanji'
import { indexRowOf } from '@/lib/content/kanji/kanjiText'

const UNITS: KanjiUnit[] = [
  {
    id: 'u01',
    title: 'First kanji',
    summary: 'One, two, three, and the shapes of people and mountains.',
    kanji: ['一', '二', '三', '人', '大', '山'],
    newParts: ['一', '人', '大', '山'],
  },
  {
    id: 'u02',
    title: 'Days of the week',
    summary: 'Sun, moon and the five elements that name the days.',
    kanji: ['日', '月', '火', '水', '木', '金'],
    newParts: ['日', '月', '火', '水', '木', '金'],
  },
]

const GROUPS: KanjiGroup[] = [
  { id: 'basics', title: 'Basics', summary: 'Numbers, people and the days of the week.', unitIds: ['u01', 'u02'] },
]

const ENTRIES: KanjiEntry[] = [
  {
    char: '一', jlpt: 'n5', unitId: 'u01', strokes: 1, grade: 1, freq: 2,
    meanings: ['one'], synonyms: ['1', 'single'],
    on: ['イチ', 'イツ'], kun: [{ kana: 'ひと' }, { kana: 'ひと', okurigana: 'つ' }],
    keyReading: { type: 'on', kana: 'イチ' },
    readingTip: 'Counting uses イチ; "one thing" is ひとつ.',
    parts: [{ char: '一', name: 'one' }],
    vocab: [
      { word: '一', reading: 'いち', meaning: 'one', isKey: true },
      { word: '一つ', reading: 'ひとつ', meaning: 'one (thing)' },
      { word: '一月', reading: 'いちがつ', meaning: 'January' },
      { word: '一人', reading: 'ひとり', meaning: 'one person; alone' },
    ],
    mnemonic: { text: 'One finger laid flat: a single line is one.', draft: true },
    lookAlikes: [{ char: '二', note: '二 has two lines' }],
  },
  {
    char: '二', jlpt: 'n5', unitId: 'u01', strokes: 2, grade: 1, freq: 9,
    meanings: ['two'], synonyms: ['2'],
    on: ['ニ'], kun: [{ kana: 'ふた' }, { kana: 'ふた', okurigana: 'つ' }],
    keyReading: { type: 'on', kana: 'ニ' },
    readingTip: 'Counting uses ニ; "two things" is ふたつ.',
    parts: [{ char: '二', name: 'two' }],
    vocab: [
      { word: '二', reading: 'に', meaning: 'two', isKey: true },
      { word: '二つ', reading: 'ふたつ', meaning: 'two (things)' },
      { word: '二月', reading: 'にがつ', meaning: 'February' },
      { word: '二人', reading: 'ふたり', meaning: 'two people' },
    ],
    mnemonic: { text: 'Two fingers laid flat, the bottom one longer: two lines, two.', draft: true },
    lookAlikes: [{ char: '一', note: '一 has one line' }, { char: '三', note: '三 has three lines' }],
  },
  {
    char: '三', jlpt: 'n5', unitId: 'u01', strokes: 3, grade: 1, freq: 14,
    meanings: ['three'], synonyms: ['3'],
    on: ['サン'], kun: [{ kana: 'み' }, { kana: 'み', okurigana: 'つ' }, { kana: 'みっ', okurigana: 'つ' }],
    keyReading: { type: 'on', kana: 'サン' },
    readingTip: 'Counting uses サン; "three things" is みっつ.',
    parts: [{ char: '三', name: 'three' }],
    vocab: [
      { word: '三', reading: 'さん', meaning: 'three', isKey: true },
      { word: '三つ', reading: 'みっつ', meaning: 'three (things)' },
      { word: '三月', reading: 'さんがつ', meaning: 'March' },
      { word: '三人', reading: 'さんにん', meaning: 'three people' },
    ],
    mnemonic: { text: 'Three lines stacked like three steps: three.', draft: true },
    lookAlikes: [{ char: '二', note: '二 has two lines' }],
  },
  {
    char: '人', jlpt: 'n5', unitId: 'u01', strokes: 2, grade: 1, freq: 5,
    meanings: ['person'], synonyms: ['people', 'human'],
    on: ['ジン', 'ニン'], kun: [{ kana: 'ひと' }],
    keyReading: { type: 'kun', kana: 'ひと' },
    readingTip: 'Alone it is ひと; nationality is じん (日本人); counting people is にん (三人).',
    parts: [{ char: '人', name: 'person' }],
    vocab: [
      { word: '人', reading: 'ひと', meaning: 'person', isKey: true },
      { word: '日本人', reading: 'にほんじん', meaning: 'Japanese person' },
      { word: '三人', reading: 'さんにん', meaning: 'three people' },
      { word: '一人', reading: 'ひとり', meaning: 'one person; alone' },
    ],
    mnemonic: { text: 'Two legs walking: a person seen from the side, mid-stride.', draft: true },
    lookAlikes: [{ char: '入', note: '入 enter: the right stroke sits on top' }, { char: '大', note: '大 adds arms across' }],
  },
  {
    char: '大', jlpt: 'n5', unitId: 'u01', strokes: 3, grade: 1, freq: 7,
    meanings: ['big', 'large'], synonyms: ['great'],
    on: ['ダイ', 'タイ'], kun: [{ kana: 'おお' }, { kana: 'おお', okurigana: 'きい' }, { kana: 'おお', okurigana: 'いに' }],
    keyReading: { type: 'kun', kana: 'おお' },
    readingTip: 'The adjective is おおきい; in compounds usually ダイ (大学).',
    parts: [{ char: '大', name: 'big' }],
    vocab: [
      { word: '大きい', reading: 'おおきい', meaning: 'big', isKey: true },
      { word: '大学', reading: 'だいがく', meaning: 'university' },
      { word: '大人', reading: 'おとな', meaning: 'adult' },
    ],
    mnemonic: { text: 'A person (人) stretching both arms wide to show how big it was.', draft: true },
    lookAlikes: [{ char: '人', note: '人 has no arms' }, { char: '犬', note: '犬 dog adds a dot' }],
  },
  {
    char: '山', jlpt: 'n5', unitId: 'u01', strokes: 3, grade: 1, freq: 131,
    meanings: ['mountain'], synonyms: ['mount', 'hill'],
    on: ['サン'], kun: [{ kana: 'やま' }],
    keyReading: { type: 'kun', kana: 'やま' },
    readingTip: 'Alone it is やま; after a name it is サン (富士山).',
    parts: [{ char: '山', name: 'mountain' }],
    vocab: [
      { word: '山', reading: 'やま', meaning: 'mountain', isKey: true },
      { word: '火山', reading: 'かざん', meaning: 'volcano' },
      { word: '山田', reading: 'やまだ', meaning: 'Yamada (surname)' },
    ],
    mnemonic: { text: 'Three peaks, the middle one tallest: a mountain range.', draft: true },
  },
  {
    char: '日', jlpt: 'n5', unitId: 'u02', strokes: 4, grade: 1, freq: 1,
    meanings: ['day', 'sun', 'Japan'], synonyms: ['days'],
    on: ['ニチ', 'ジツ'], kun: [{ kana: 'ひ' }, { kana: 'び', affix: 'suffix' }, { kana: 'か', affix: 'suffix' }],
    keyReading: { type: 'on', kana: 'ニチ' },
    readingTip: 'Alone it is ひ; in compounds usually ニチ; 日本 shortens it to に.',
    parts: [{ char: '日', name: 'sun' }],
    vocab: [
      { word: '毎日', reading: 'まいにち', meaning: 'every day', isKey: true },
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
      { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' },
      { word: '日', reading: 'ひ', meaning: 'sun; day' },
      { word: '今日', reading: 'きょう', meaning: 'today' },
    ],
    mnemonic: { text: 'A window with one bar: sunlight shines through it all day.', draft: true },
    lookAlikes: [{ char: '目', note: '目 eye has two inner bars' }, { char: '白', note: '白 white has a tick on top' }],
  },
  {
    char: '月', jlpt: 'n5', unitId: 'u02', strokes: 4, grade: 1, freq: 23,
    meanings: ['moon', 'month'], synonyms: ['months'],
    on: ['ゲツ', 'ガツ'], kun: [{ kana: 'つき' }],
    keyReading: { type: 'on', kana: 'ゲツ' },
    readingTip: 'Months are ガツ (一月); Monday is ゲツ; the moon itself is つき.',
    parts: [{ char: '月', name: 'moon' }],
    vocab: [
      { word: '月曜日', reading: 'げつようび', meaning: 'Monday', isKey: true },
      { word: '一月', reading: 'いちがつ', meaning: 'January' },
      { word: '月', reading: 'つき', meaning: 'moon' },
      { word: '今月', reading: 'こんげつ', meaning: 'this month' },
    ],
    mnemonic: { text: 'A crescent moon leaning on two clouds, glowing for a month.', draft: true },
    lookAlikes: [{ char: '日', note: '日 is shorter and closed at the bottom' }],
  },
  {
    char: '火', jlpt: 'n5', unitId: 'u02', strokes: 4, grade: 1, freq: 574,
    meanings: ['fire'], synonyms: ['flame'],
    on: ['カ'], kun: [{ kana: 'ひ' }, { kana: 'び', affix: 'suffix' }, { kana: 'ほ' }],
    keyReading: { type: 'on', kana: 'カ' },
    readingTip: 'Alone it is ひ; in compounds usually カ (火曜日).',
    parts: [{ char: '火', name: 'fire' }],
    vocab: [
      { word: '火曜日', reading: 'かようび', meaning: 'Tuesday', isKey: true },
      { word: '火', reading: 'ひ', meaning: 'fire' },
      { word: '火山', reading: 'かざん', meaning: 'volcano' },
    ],
    mnemonic: { text: 'A person (人) waving both arms beside a campfire, sparks flying up.', draft: true },
  },
  {
    char: '水', jlpt: 'n5', unitId: 'u02', strokes: 4, grade: 1, freq: 223,
    meanings: ['water'], synonyms: [],
    on: ['スイ'], kun: [{ kana: 'みず' }],
    keyReading: { type: 'kun', kana: 'みず' },
    readingTip: 'Alone it is みず; in compounds usually スイ (水曜日).',
    parts: [{ char: '水', name: 'water' }],
    vocab: [
      { word: '水', reading: 'みず', meaning: 'water', isKey: true },
      { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
    ],
    mnemonic: { text: 'A stream down the middle with splashes flying off both sides.', draft: true },
    lookAlikes: [{ char: '木', note: '木 tree has a crossbar, no splashes' }],
  },
  {
    char: '木', jlpt: 'n5', unitId: 'u02', strokes: 4, grade: 1, freq: 317,
    meanings: ['tree', 'wood'], synonyms: ['trees'],
    on: ['ボク', 'モク'], kun: [{ kana: 'き' }, { kana: 'こ', affix: 'prefix' }],
    keyReading: { type: 'kun', kana: 'き' },
    readingTip: 'Alone it is き; Thursday is モク (木曜日).',
    parts: [{ char: '木', name: 'tree' }],
    vocab: [
      { word: '木', reading: 'き', meaning: 'tree; wood', isKey: true },
      { word: '木曜日', reading: 'もくようび', meaning: 'Thursday' },
    ],
    mnemonic: { text: 'A trunk with one branch across and two roots spreading below: a tree.', draft: true },
    lookAlikes: [{ char: '本', note: '本 adds a short line at the root' }, { char: '水', note: '水 water splashes' }],
  },
  {
    char: '金', jlpt: 'n5', unitId: 'u02', strokes: 8, grade: 1, freq: 53,
    meanings: ['gold', 'money', 'metal'], synonyms: ['golden'],
    on: ['キン', 'コン'], kun: [{ kana: 'かね' }, { kana: 'かな', affix: 'prefix' }],
    keyReading: { type: 'on', kana: 'キン' },
    readingTip: 'Friday and gold are キン; money is かね (お金).',
    parts: [{ char: '金', name: 'gold' }],
    vocab: [
      { word: '金曜日', reading: 'きんようび', meaning: 'Friday', isKey: true },
      { word: 'お金', reading: 'おかね', meaning: 'money' },
      { word: '金', reading: 'きん', meaning: 'gold' },
    ],
    mnemonic: { text: 'A roof over a mine shaft, with two gold nuggets glinting in the earth.', draft: true },
  },
]

export const KANJI_FIXTURE_N5_DETAIL: KanjiLevelDetail = { level: 'n5', entries: ENTRIES }

export const KANJI_FIXTURE_N5_INDEX: KanjiLevelIndex = {
  level: 'n5',
  units: UNITS,
  groups: GROUPS,
  rows: ENTRIES.map(indexRowOf),
}
