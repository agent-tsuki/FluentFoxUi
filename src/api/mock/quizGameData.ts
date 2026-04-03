/**
 * Quiz Game Mock Data
 *
 * All quiz questions are stored here as plain data arrays.
 * To connect a real API, replace the exported arrays with fetch() calls in quizGameService.ts.
 * Each question has exactly 4 options — correct answer is always included.
 */

import type { QuizQuestionData } from '@/types'

// ─── Hiragana → Romaji ────────────────────────────────────────────────────────

export const hiraganaToRomajiQuestions: QuizQuestionData[] = [
  // Vowels
  { id: 'h-a',   type: 'hiragana-to-romaji', prompt: 'あ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'a',   options: ['a', 'i', 'u', 'e'] },
  { id: 'h-i',   type: 'hiragana-to-romaji', prompt: 'い', promptLabel: 'What is the romaji for this character?', correctAnswer: 'i',   options: ['a', 'i', 'u', 'e'] },
  { id: 'h-u',   type: 'hiragana-to-romaji', prompt: 'う', promptLabel: 'What is the romaji for this character?', correctAnswer: 'u',   options: ['i', 'u', 'o', 'a'] },
  { id: 'h-e',   type: 'hiragana-to-romaji', prompt: 'え', promptLabel: 'What is the romaji for this character?', correctAnswer: 'e',   options: ['u', 'e', 'o', 'a'] },
  { id: 'h-o',   type: 'hiragana-to-romaji', prompt: 'お', promptLabel: 'What is the romaji for this character?', correctAnswer: 'o',   options: ['i', 'u', 'o', 'e'] },
  // K row
  { id: 'h-ka',  type: 'hiragana-to-romaji', prompt: 'か', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ka',  options: ['ka', 'ki', 'ga', 'ko'] },
  { id: 'h-ki',  type: 'hiragana-to-romaji', prompt: 'き', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ki',  options: ['ka', 'ki', 'ku', 'gi'] },
  { id: 'h-ku',  type: 'hiragana-to-romaji', prompt: 'く', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ku',  options: ['ku', 'ke', 'gu', 'ko'] },
  { id: 'h-ke',  type: 'hiragana-to-romaji', prompt: 'け', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ke',  options: ['ka', 'ke', 'ge', 'ko'] },
  { id: 'h-ko',  type: 'hiragana-to-romaji', prompt: 'こ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ko',  options: ['ka', 'ko', 'go', 'ku'] },
  // S row
  { id: 'h-sa',  type: 'hiragana-to-romaji', prompt: 'さ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'sa',  options: ['sa', 'za', 'ta', 'se'] },
  { id: 'h-shi', type: 'hiragana-to-romaji', prompt: 'し', promptLabel: 'What is the romaji for this character?', correctAnswer: 'shi', options: ['shi', 'chi', 'si', 'ji'] },
  { id: 'h-su',  type: 'hiragana-to-romaji', prompt: 'す', promptLabel: 'What is the romaji for this character?', correctAnswer: 'su',  options: ['su', 'zu', 'tsu', 'nu'] },
  { id: 'h-se',  type: 'hiragana-to-romaji', prompt: 'せ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'se',  options: ['se', 'ze', 'te', 'sa'] },
  { id: 'h-so',  type: 'hiragana-to-romaji', prompt: 'そ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'so',  options: ['sa', 'so', 'zo', 'to'] },
  // T row
  { id: 'h-ta',  type: 'hiragana-to-romaji', prompt: 'た', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ta',  options: ['ta', 'da', 'sa', 'na'] },
  { id: 'h-chi', type: 'hiragana-to-romaji', prompt: 'ち', promptLabel: 'What is the romaji for this character?', correctAnswer: 'chi', options: ['chi', 'shi', 'ji', 'ni'] },
  { id: 'h-tsu', type: 'hiragana-to-romaji', prompt: 'つ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'tsu', options: ['tsu', 'su', 'zu', 'fu'] },
  { id: 'h-te',  type: 'hiragana-to-romaji', prompt: 'て', promptLabel: 'What is the romaji for this character?', correctAnswer: 'te',  options: ['te', 'de', 'ke', 'se'] },
  { id: 'h-to',  type: 'hiragana-to-romaji', prompt: 'と', promptLabel: 'What is the romaji for this character?', correctAnswer: 'to',  options: ['to', 'do', 'so', 'ko'] },
  // N row
  { id: 'h-na',  type: 'hiragana-to-romaji', prompt: 'な', promptLabel: 'What is the romaji for this character?', correctAnswer: 'na',  options: ['na', 'ta', 'ma', 'ra'] },
  { id: 'h-ni',  type: 'hiragana-to-romaji', prompt: 'に', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ni',  options: ['ni', 'mi', 'ri', 'chi'] },
  { id: 'h-nu',  type: 'hiragana-to-romaji', prompt: 'ぬ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'nu',  options: ['nu', 'mu', 'ru', 'fu'] },
  { id: 'h-ne',  type: 'hiragana-to-romaji', prompt: 'ね', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ne',  options: ['ne', 'me', 're', 'he'] },
  { id: 'h-no',  type: 'hiragana-to-romaji', prompt: 'の', promptLabel: 'What is the romaji for this character?', correctAnswer: 'no',  options: ['no', 'mo', 'ro', 'wo'] },
  // H row
  { id: 'h-ha',  type: 'hiragana-to-romaji', prompt: 'は', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ha',  options: ['ha', 'ba', 'pa', 'wa'] },
  { id: 'h-hi',  type: 'hiragana-to-romaji', prompt: 'ひ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'hi',  options: ['hi', 'bi', 'pi', 'ri'] },
  { id: 'h-fu',  type: 'hiragana-to-romaji', prompt: 'ふ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'fu',  options: ['fu', 'hu', 'bu', 'pu'] },
  { id: 'h-he',  type: 'hiragana-to-romaji', prompt: 'へ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'he',  options: ['he', 'be', 'pe', 'se'] },
  { id: 'h-ho',  type: 'hiragana-to-romaji', prompt: 'ほ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ho',  options: ['ho', 'bo', 'po', 'ko'] },
  // M row
  { id: 'h-ma',  type: 'hiragana-to-romaji', prompt: 'ま', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ma',  options: ['ma', 'na', 'ra', 'ba'] },
  { id: 'h-mi',  type: 'hiragana-to-romaji', prompt: 'み', promptLabel: 'What is the romaji for this character?', correctAnswer: 'mi',  options: ['mi', 'ni', 'ri', 'bi'] },
  { id: 'h-mu',  type: 'hiragana-to-romaji', prompt: 'む', promptLabel: 'What is the romaji for this character?', correctAnswer: 'mu',  options: ['mu', 'nu', 'ru', 'bu'] },
  { id: 'h-me',  type: 'hiragana-to-romaji', prompt: 'め', promptLabel: 'What is the romaji for this character?', correctAnswer: 'me',  options: ['me', 'ne', 're', 'be'] },
  { id: 'h-mo',  type: 'hiragana-to-romaji', prompt: 'も', promptLabel: 'What is the romaji for this character?', correctAnswer: 'mo',  options: ['mo', 'no', 'ro', 'bo'] },
  // Y row
  { id: 'h-ya',  type: 'hiragana-to-romaji', prompt: 'や', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ya',  options: ['ya', 'wa', 'ra', 'ha'] },
  { id: 'h-yu',  type: 'hiragana-to-romaji', prompt: 'ゆ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'yu',  options: ['ya', 'yu', 'yo', 'ru'] },
  { id: 'h-yo',  type: 'hiragana-to-romaji', prompt: 'よ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'yo',  options: ['ya', 'yo', 'ro', 'wo'] },
  // R row
  { id: 'h-ra',  type: 'hiragana-to-romaji', prompt: 'ら', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ra',  options: ['ra', 'la', 'wa', 'na'] },
  { id: 'h-ri',  type: 'hiragana-to-romaji', prompt: 'り', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ri',  options: ['ri', 'li', 'ni', 'mi'] },
  { id: 'h-ru',  type: 'hiragana-to-romaji', prompt: 'る', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ru',  options: ['ru', 'lu', 'nu', 'mu'] },
  { id: 'h-re',  type: 'hiragana-to-romaji', prompt: 'れ', promptLabel: 'What is the romaji for this character?', correctAnswer: 're',  options: ['re', 'le', 'ne', 'me'] },
  { id: 'h-ro',  type: 'hiragana-to-romaji', prompt: 'ろ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'ro',  options: ['ro', 'lo', 'no', 'mo'] },
  // W row + N
  { id: 'h-wa',  type: 'hiragana-to-romaji', prompt: 'わ', promptLabel: 'What is the romaji for this character?', correctAnswer: 'wa',  options: ['wa', 'ra', 'ha', 'ya'] },
  { id: 'h-wo',  type: 'hiragana-to-romaji', prompt: 'を', promptLabel: 'What is the romaji for this character?', correctAnswer: 'wo',  options: ['wo', 'no', 'mo', 'ro'] },
  { id: 'h-n',   type: 'hiragana-to-romaji', prompt: 'ん', promptLabel: 'What is the romaji for this character?', correctAnswer: 'n',   options: ['n', 'nu', 'na', 'ni'] },
]

// ─── Kanji → Meaning (N5) ─────────────────────────────────────────────────────

export const kanjiToMeaningN5: QuizQuestionData[] = [
  { id: 'km-hi',     type: 'kanji-to-meaning', prompt: '日', promptLabel: 'What does this kanji mean?', correctAnswer: 'Sun / Day',     options: ['Sun / Day', 'Moon / Month', 'Fire', 'Star'] },
  { id: 'km-tsuki',  type: 'kanji-to-meaning', prompt: '月', promptLabel: 'What does this kanji mean?', correctAnswer: 'Moon / Month',  options: ['Moon / Month', 'Sun / Day', 'Night', 'Water'] },
  { id: 'km-hi2',    type: 'kanji-to-meaning', prompt: '火', promptLabel: 'What does this kanji mean?', correctAnswer: 'Fire',          options: ['Fire', 'Water', 'Earth', 'Wind'] },
  { id: 'km-mizu',   type: 'kanji-to-meaning', prompt: '水', promptLabel: 'What does this kanji mean?', correctAnswer: 'Water',         options: ['Water', 'Fire', 'Ice', 'River'] },
  { id: 'km-ki',     type: 'kanji-to-meaning', prompt: '木', promptLabel: 'What does this kanji mean?', correctAnswer: 'Tree / Wood',   options: ['Tree / Wood', 'Forest', 'Flower', 'Leaf'] },
  { id: 'km-kane',   type: 'kanji-to-meaning', prompt: '金', promptLabel: 'What does this kanji mean?', correctAnswer: 'Gold / Money',  options: ['Gold / Money', 'Silver', 'Iron', 'Stone'] },
  { id: 'km-tsuchi', type: 'kanji-to-meaning', prompt: '土', promptLabel: 'What does this kanji mean?', correctAnswer: 'Earth / Soil',  options: ['Earth / Soil', 'Stone', 'Mountain', 'Sand'] },
  { id: 'km-yama',   type: 'kanji-to-meaning', prompt: '山', promptLabel: 'What does this kanji mean?', correctAnswer: 'Mountain',      options: ['Mountain', 'River', 'Valley', 'Hill'] },
  { id: 'km-kawa',   type: 'kanji-to-meaning', prompt: '川', promptLabel: 'What does this kanji mean?', correctAnswer: 'River',         options: ['River', 'Lake', 'Sea', 'Stream'] },
  { id: 'km-ta',     type: 'kanji-to-meaning', prompt: '田', promptLabel: 'What does this kanji mean?', correctAnswer: 'Rice Field',    options: ['Rice Field', 'Garden', 'Forest', 'Farm'] },
  { id: 'km-hito',   type: 'kanji-to-meaning', prompt: '人', promptLabel: 'What does this kanji mean?', correctAnswer: 'Person',        options: ['Person', 'Man', 'Child', 'Body'] },
  { id: 'km-kuchi',  type: 'kanji-to-meaning', prompt: '口', promptLabel: 'What does this kanji mean?', correctAnswer: 'Mouth',         options: ['Mouth', 'Eye', 'Nose', 'Ear'] },
  { id: 'km-me',     type: 'kanji-to-meaning', prompt: '目', promptLabel: 'What does this kanji mean?', correctAnswer: 'Eye',           options: ['Eye', 'Mouth', 'Ear', 'Face'] },
  { id: 'km-te',     type: 'kanji-to-meaning', prompt: '手', promptLabel: 'What does this kanji mean?', correctAnswer: 'Hand',          options: ['Hand', 'Foot', 'Arm', 'Finger'] },
  { id: 'km-ashi',   type: 'kanji-to-meaning', prompt: '足', promptLabel: 'What does this kanji mean?', correctAnswer: 'Foot / Leg',    options: ['Foot / Leg', 'Hand', 'Arm', 'Knee'] },
  { id: 'km-chikara',type: 'kanji-to-meaning', prompt: '力', promptLabel: 'What does this kanji mean?', correctAnswer: 'Power / Force', options: ['Power / Force', 'Speed', 'Mind', 'Energy'] },
  { id: 'km-oo',     type: 'kanji-to-meaning', prompt: '大', promptLabel: 'What does this kanji mean?', correctAnswer: 'Large / Big',   options: ['Large / Big', 'Small', 'Tall', 'Heavy'] },
  { id: 'km-ko',     type: 'kanji-to-meaning', prompt: '小', promptLabel: 'What does this kanji mean?', correctAnswer: 'Small / Little',options: ['Small / Little', 'Large', 'Thin', 'Short'] },
  { id: 'km-naka',   type: 'kanji-to-meaning', prompt: '中', promptLabel: 'What does this kanji mean?', correctAnswer: 'Middle / Inside',options: ['Middle / Inside', 'Outside', 'Above', 'Below'] },
  { id: 'km-ue',     type: 'kanji-to-meaning', prompt: '上', promptLabel: 'What does this kanji mean?', correctAnswer: 'Above / Up',    options: ['Above / Up', 'Below / Down', 'Left', 'Right'] },
  { id: 'km-shita',  type: 'kanji-to-meaning', prompt: '下', promptLabel: 'What does this kanji mean?', correctAnswer: 'Below / Down',  options: ['Below / Down', 'Above / Up', 'Left', 'Right'] },
  { id: 'km-hito2',  type: 'kanji-to-meaning', prompt: '一', promptLabel: 'What does this kanji mean?', correctAnswer: 'One',           options: ['One', 'Two', 'Three', 'First'] },
  { id: 'km-ni',     type: 'kanji-to-meaning', prompt: '二', promptLabel: 'What does this kanji mean?', correctAnswer: 'Two',           options: ['Two', 'One', 'Three', 'Second'] },
  { id: 'km-san',    type: 'kanji-to-meaning', prompt: '三', promptLabel: 'What does this kanji mean?', correctAnswer: 'Three',         options: ['Three', 'Two', 'Four', 'Several'] },
  { id: 'km-yon',    type: 'kanji-to-meaning', prompt: '四', promptLabel: 'What does this kanji mean?', correctAnswer: 'Four',          options: ['Four', 'Three', 'Five', 'Fourteen'] },
  { id: 'km-go',     type: 'kanji-to-meaning', prompt: '五', promptLabel: 'What does this kanji mean?', correctAnswer: 'Five',          options: ['Five', 'Four', 'Six', 'Fifty'] },
]

// ─── Kanji → On'yomi Reading (N5) ────────────────────────────────────────────

export const kanjiToOnyomiN5: QuizQuestionData[] = [
  { id: 'ko-nichi',  type: 'kanji-to-onyomi', prompt: '日', promptLabel: "What is the on'yomi reading?", correctAnswer: 'ニチ',  options: ['ニチ', 'ゲツ', 'カ', 'スイ'] },
  { id: 'ko-getsu',  type: 'kanji-to-onyomi', prompt: '月', promptLabel: "What is the on'yomi reading?", correctAnswer: 'ゲツ',  options: ['ゲツ', 'ニチ', 'カ', 'モク'] },
  { id: 'ko-ka',     type: 'kanji-to-onyomi', prompt: '火', promptLabel: "What is the on'yomi reading?", correctAnswer: 'カ',    options: ['カ', 'スイ', 'モク', 'ニチ'] },
  { id: 'ko-sui',    type: 'kanji-to-onyomi', prompt: '水', promptLabel: "What is the on'yomi reading?", correctAnswer: 'スイ',  options: ['スイ', 'カ', 'ドウ', 'モク'] },
  { id: 'ko-moku',   type: 'kanji-to-onyomi', prompt: '木', promptLabel: "What is the on'yomi reading?", correctAnswer: 'モク',  options: ['モク', 'スイ', 'ド', 'キン'] },
  { id: 'ko-kin',    type: 'kanji-to-onyomi', prompt: '金', promptLabel: "What is the on'yomi reading?", correctAnswer: 'キン',  options: ['キン', 'ゴン', 'モク', 'ド'] },
  { id: 'ko-do',     type: 'kanji-to-onyomi', prompt: '土', promptLabel: "What is the on'yomi reading?", correctAnswer: 'ド',    options: ['ド', 'ト', 'キン', 'モク'] },
  { id: 'ko-san',    type: 'kanji-to-onyomi', prompt: '山', promptLabel: "What is the on'yomi reading?", correctAnswer: 'サン',  options: ['サン', 'セン', 'コウ', 'ジョウ'] },
  { id: 'ko-sen',    type: 'kanji-to-onyomi', prompt: '川', promptLabel: "What is the on'yomi reading?", correctAnswer: 'セン',  options: ['セン', 'サン', 'コウ', 'カワ'] },
  { id: 'ko-jin',    type: 'kanji-to-onyomi', prompt: '人', promptLabel: "What is the on'yomi reading?", correctAnswer: 'ジン',  options: ['ジン', 'ニン', 'ヒト', 'コウ'] },
  { id: 'ko-ichi',   type: 'kanji-to-onyomi', prompt: '一', promptLabel: "What is the on'yomi reading?", correctAnswer: 'イチ',  options: ['イチ', 'ニ', 'サン', 'シ'] },
  { id: 'ko-ni2',    type: 'kanji-to-onyomi', prompt: '二', promptLabel: "What is the on'yomi reading?", correctAnswer: 'ニ',    options: ['ニ', 'イチ', 'サン', 'ジ'] },
]

// ─── All questions pool (for mixed sessions) ─────────────────────────────────

export const allQuizQuestions: QuizQuestionData[] = [
  ...hiraganaToRomajiQuestions,
  ...kanjiToMeaningN5,
  ...kanjiToOnyomiN5,
]
