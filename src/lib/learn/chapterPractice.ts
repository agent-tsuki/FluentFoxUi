/**
 * A chapter's Exercise tab: the exercises a learner can start directly, built
 * from the chapter's own content. Vocabulary, listening, word tiles and
 * writing come from the words and listening lines; true/false, change-the-form
 * and picture questions are written by hand. Nothing here is saved. Pure.
 */
import { pickDistractors } from '@/lib/testCenter/plan'
import { shuffle } from '@/lib/pdf/shared'
import { parseRubyLine, type RubyLine } from '@/lib/content/listening/rubyText'
import { splitGap } from '@/lib/testCenter/grammarQuestions'
import type { TestQuestion } from '@/lib/testCenter/types'
import type { ChapterContent, ChapterPicture, ChapterTransform, ChapterTrueFalse, ChapterWordContent, ChapterWordSentence } from '@/types/grammar'

export type PracticeGroup = 'Vocabulary' | 'Confirm' | 'Construct' | 'Review'

export interface PracticeSet {
  id: string
  group: PracticeGroup
  title: string
  summary: string
  icon: string
  /** Fresh questions, in a new order each time; `count` overrides the exercise's size. */
  build: (random?: () => number, count?: number) => TestQuestion[]
  /** How many questions the learner may ask for, when that can vary. */
  sizes?: number[]
  /** The blanks are filled by dragging words from one shared bank, not from a dropdown. */
  wordBank?: boolean
}

/** Questions in one vocabulary round, and in the sets drawn from a larger pool. */
const ROUND_SIZE = 5
/** A vocabulary round: at least this many, or every word when a chapter has more to offer. */
const VOCAB_SIZES = [10, 15, 20]
const REVIEW_MIN = 5
const REVIEW_TARGET = 8
const REVIEW_MAX = 10
const OPTION_COUNT = 4
const WRONG_OPTIONS = OPTION_COUNT - 1
const MIN_WORDS_FOR_ROUND = OPTION_COUNT
/** A learner can place this many tiles without it becoming a puzzle. */
const TILES_MIN = 3
const TILES_MAX = 7
const WRITE_MIN = 2
const WRITE_MAX = 5
/** More marked phrases than this can be correctly reordered, which a single answer would mark wrong. */
const TILES_MAX_PHRASES = 2
/** Later chapters have longer sentences: used only when the short ones run out. */
const TILES_LONG_MAX = 10
const TILES_LONG_PHRASES = 3
const WRITE_LONG_MAX = 8

/** Sentences within this many words of each other count as the same length, so the short-first order still varies. */
const LENGTH_BAND = 3

const CASE_PARTICLES = new Set(['は', 'が', 'を', 'に', 'へ', 'で', 'と', 'から', 'まで'])
const FORMAT = { gap: 'grammar-gap', typed: 'grammar-typed', meaning: 'grammar-meaning', vocabMeaning: 'vocab-meaning', vocabWord: 'vocab-word' } as const

interface SpokenLine {
  ruby: RubyLine
  say: string
  translation: string
  voice?: string
}

type Random = () => number

const take = <T,>(items: readonly T[], n: number, random: Random): T[] => shuffle(items, random).slice(0, n)

/** The answer and three others, taking from `prefer` first. */
function withOptions(answer: string, others: readonly string[], random: Random, prefer: readonly string[] = []): string[] {
  return shuffle([answer, ...pickDistractors(others, (l) => l === answer, WRONG_OPTIONS, random, prefer)], random)
}

function spokenLines(content: ChapterContent): SpokenLine[] {
  return (content.passages ?? []).flatMap((p) =>
    p.lines.map((l) => {
      const ruby = parseRubyLine(l.text)
      return { ruby, say: l.say ?? ruby.spoken, translation: l.translation, voice: p.speaker_voices?.[l.speaker ?? 0] }
    }),
  )
}

/** Words that can stand alone as a question ("～人" is a suffix, not a word to pick). */
const askable = (words: readonly ChapterWordContent[]) => words.filter((w) => !w.word.includes('～'))

function meaningQuestions(words: readonly ChapterWordContent[], random: Random, count: number): TestQuestion[] {
  const meanings = words.map((w) => w.meaning)
  return take(words, count, random).map((w, i) => ({
    id: `vocab-meaning-${i}-${w.word}`,
    format: FORMAT.vocabMeaning,
    kind: 'choice',
    label: 'Word to English',
    instruction: 'What does this word mean?',
    prompt: { type: 'glyph', text: w.word, ja: true },
    translation: w.word === w.kana ? undefined : w.kana,
    answer: w.meaning,
    options: withOptions(w.meaning, meanings, random),
    optionsJa: false,
  }))
}

function wordQuestions(words: readonly ChapterWordContent[], random: Random, count: number): TestQuestion[] {
  const written = words.map((w) => w.word)
  return take(words, count, random).map((w, i) => ({
    id: `vocab-word-${i}-${w.word}`,
    format: FORMAT.vocabWord,
    kind: 'choice',
    label: 'English to word',
    instruction: 'Which word means this?',
    prompt: { type: 'glyph', text: w.meaning, ja: false },
    answer: w.word,
    options: withOptions(w.word, written, random),
    optionsJa: true,
  }))
}

const isVerb = (word: string) => word.endsWith('ます')

/** Chapter words that appear on their own in a listening line, with the line. */
function wordsInContext(words: readonly ChapterWordContent[], lines: readonly SpokenLine[]) {
  const out: { word: ChapterWordContent; line: SpokenLine; at: number }[] = []
  for (const word of words) {
    for (const line of lines) {
      const at = line.ruby.tokens.findIndex((t) => t.written === word.word)
      if (at !== -1) {
        out.push({ word, line, at })
        break
      }
    }
  }
  return out
}

/** The chapter's written sentences, each with one of its words to drop in. */
function wordSentenceQuestions(items: readonly ChapterWordSentence[], words: readonly ChapterWordContent[], random: Random): TestQuestion[] {
  const written = words.map((w) => w.word)
  return shuffle(items, random).map((s, i) => ({
    id: `vocab-sentence-${i}-${s.answer}`,
    format: FORMAT.gap,
    kind: 'select',
    label: 'Word in a sentence',
    instruction: 'Drop in the word that fits',
    prompt: { type: 'gap', ...splitGap(s.sentence) },
    translation: s.translation,
    answer: s.answer,
    options: withOptions(s.answer, written, random),
  }))
}

/** The word in a sentence, topped up with "which word reads like this?" when few lines use the words. */
function contextQuestions(words: readonly ChapterWordContent[], lines: readonly SpokenLine[], random: Random): TestQuestion[] {
  const inContext = take(wordsInContext(words, lines), VOCAB_SIZES[0], random)
  const questions: TestQuestion[] = inContext.map(({ word, line, at }, i) => {
    const written = (from: number, to?: number) =>
      line.ruby.tokens
        .slice(from, to)
        .map((t) => t.written)
        .join('')
    // None that is already in the sentence; the same kind of word first, so verbs compete with verbs.
    const unused = words.filter((w) => !line.ruby.spoken.includes(w.word))
    const others = unused.map((w) => w.word)
    const sameKind = unused.filter((w) => isVerb(w.word) === isVerb(word.word)).map((w) => w.word)
    return {
      id: `vocab-context-${i}-${word.word}`,
      format: FORMAT.gap,
      kind: 'select',
      label: 'Word in a sentence',
      instruction: 'Drop in the word that fits',
      prompt: { type: 'gap', before: written(0, at), after: written(at + 1) },
      translation: line.translation,
      answer: word.word,
      options: withOptions(word.word, others, random, sameKind),
    }
  })
  const used = new Set(inContext.map((c) => c.word.word))
  const written = words.map((w) => w.word)
  const readings = words.filter((w) => w.word !== w.kana && !used.has(w.word))
  for (const [i, w] of take(readings, VOCAB_SIZES[0] - questions.length, random).entries()) {
    questions.push({
      id: `vocab-reading-${i}-${w.word}`,
      format: FORMAT.vocabWord,
      kind: 'choice',
      label: 'Word from its reading',
      instruction: 'Which word is read like this?',
      prompt: { type: 'glyph', text: w.kana, ja: true },
      answer: w.word,
      options: withOptions(w.word, written, random),
      optionsJa: true,
    })
  }
  return questions
}

function gapQuestions(content: ChapterContent, random: Random): TestQuestion[] {
  return shuffle(content.gaps ?? [], random).map((g, i) => ({
    id: `check-${i}`,
    format: FORMAT.gap,
    kind: 'select',
    label: 'Choose the word',
    instruction: 'Choose the word that fills the gap',
    prompt: { type: 'gap', ...splitGap(g.sentence) },
    translation: g.translation,
    answer: g.answer,
    options: shuffle([g.answer, ...g.distractors], random),
    explanation: g.explanation,
  }))
}

function trueFalseQuestions(items: readonly ChapterTrueFalse[], random: Random): TestQuestion[] {
  return shuffle(items, random).map((t, i) => ({
    id: `true-false-${i}`,
    format: FORMAT.meaning,
    kind: 'choice',
    label: 'True or false',
    instruction: 'Read the exchange. Is this true?',
    prompt: { type: 'exchange', lines: t.lines, statement: t.statement },
    answer: t.answer ? 'True' : 'False',
    options: ['True', 'False'],
    optionsJa: false,
    explanation: t.explanation,
  }))
}

function pictureQuestions(items: readonly ChapterPicture[], random: Random): TestQuestion[] {
  return shuffle(items, random).map((p, i) => ({
    id: `picture-${i}`,
    format: FORMAT.gap,
    kind: 'choice',
    label: 'Look and choose',
    instruction: 'Look at the picture and choose the word',
    prompt: { type: 'picture', src: p.image, alt: p.alt, ...splitGap(p.sentence) },
    translation: p.translation,
    answer: p.answer,
    options: withOptions(p.answer, p.options, random),
    optionsJa: true,
  }))
}

function listenQuestions(lines: readonly SpokenLine[], random: Random): TestQuestion[] {
  const translations = lines.map((l) => l.translation)
  return take(lines, ROUND_SIZE, random).map((l, i) => ({
    id: `listen-${i}`,
    format: FORMAT.meaning,
    kind: 'choice',
    label: 'Listen and choose',
    instruction: 'Listen, then choose what it means',
    prompt: { type: 'audio', text: l.say, voice: l.voice },
    answer: l.translation,
    options: withOptions(l.translation, translations, random),
    optionsJa: false,
    explanation: l.ruby.spoken,
  }))
}

const wordTokens = (ruby: RubyLine) => ruby.tokens.filter((t) => !t.punct)
const isPlainSentence = (ruby: RubyLine) => ruby.sentences === 1 && !ruby.tokens.some((t) => t.punct && '、「」'.includes(t.written))

/** `strict` when there are enough of them; otherwise `loose` tops them up. */
function shortFirst(strict: SpokenLine[], loose: SpokenLine[]): SpokenLine[] {
  return strict.length >= ROUND_SIZE ? strict : [...strict, ...loose.filter((l) => !strict.includes(l))]
}

function tileLines(lines: readonly SpokenLine[]): SpokenLine[] {
  const fits = (maxWords: number, maxPhrases: number) =>
    lines.filter((l) => {
      const words = wordTokens(l.ruby)
      const phrases = words.filter((t) => CASE_PARTICLES.has(t.written)).length
      return isPlainSentence(l.ruby) && words.length >= TILES_MIN && words.length <= maxWords && phrases <= maxPhrases
    })
  return shortFirst(fits(TILES_MAX, TILES_MAX_PHRASES), fits(TILES_LONG_MAX, TILES_LONG_PHRASES))
}

function writeLines(lines: readonly SpokenLine[]): SpokenLine[] {
  const fits = (maxWords: number) =>
    lines.filter((l) => {
      const n = wordTokens(l.ruby).length
      return isPlainSentence(l.ruby) && n >= WRITE_MIN && n <= maxWords
    })
  return shortFirst(fits(WRITE_MAX), fits(WRITE_LONG_MAX))
}

/** Up to a round's worth, the shortest lines first (the longer ones only fill in). */
function takeShortFirst(candidates: readonly SpokenLine[], random: Random): SpokenLine[] {
  return [...candidates]
    .map((line) => ({ line, size: Math.floor(wordTokens(line.ruby).length / LENGTH_BAND) + random() }))
    .sort((a, b) => a.size - b.size)
    .slice(0, ROUND_SIZE)
    .map((c) => c.line)
}

/** Shuffled, but never already in the right order. */
function scrambled(tiles: readonly string[], random: Random): string[] {
  let out = shuffle(tiles, random)
  for (let i = 0; i < tiles.length && out.join('|') === tiles.join('|'); i++) out = shuffle(tiles, random)
  return out.join('|') === tiles.join('|') ? [...tiles.slice(1), tiles[0]] : out
}

function tileQuestions(lines: readonly SpokenLine[], random: Random): TestQuestion[] {
  return shuffle(takeShortFirst(tileLines(lines), random), random).map((l, i) => {
    const tiles = wordTokens(l.ruby).map((t) => t.written)
    return {
      id: `tiles-${i}`,
      format: FORMAT.typed,
      kind: 'tiles',
      label: 'Put in order',
      instruction: 'Put the words in order',
      prompt: { type: 'glyph', text: l.translation, ja: false },
      answer: l.ruby.spoken,
      tiles: scrambled(tiles, random),
      accepted: [tiles.join('')],
    }
  })
}

function transformQuestions(items: readonly ChapterTransform[], random: Random): TestQuestion[] {
  return shuffle(items, random).map((t, i) => ({
    id: `change-${i}`,
    format: FORMAT.typed,
    kind: 'text',
    label: 'Change the form',
    instruction: t.task,
    source: t.source,
    prompt: { type: 'gap', ...splitGap(t.sentence) },
    answer: t.answer,
    compare: 'japanese',
    accepted: [t.answer, ...(t.also_accept ?? [])],
    placeholder: 'kana or romaji',
    explanation: t.explanation,
  }))
}

/** "私は" can be left out of a Japanese sentence, so an answer without it is right too. */
const SAID_WITHOUT_TOPIC = /^(私|わたし)は/

function writeQuestions(lines: readonly SpokenLine[], random: Random): TestQuestion[] {
  return shuffle(takeShortFirst(writeLines(lines), random), random).map((l, i) => {
    const hiragana = wordTokens(l.ruby)
      .map((t) => t.hiragana)
      .join('')
    const accepted = [l.ruby.spoken, hiragana].flatMap((a) => [a, a.replace(SAID_WITHOUT_TOPIC, '')])
    return {
      id: `write-${i}`,
      format: FORMAT.typed,
      kind: 'text',
      label: 'Write it',
      instruction: 'Write this in Japanese',
      prompt: { type: 'glyph', text: l.translation, ja: false },
      answer: l.ruby.spoken,
      compare: 'japanese',
      accepted,
      placeholder: 'kana, kanji or romaji',
    }
  })
}

/** At least one of each kind, then filled up at random, so a Review always mixes. */
function reviewQuestions(pools: readonly TestQuestion[][], random: Random): TestQuestion[] {
  const filled = pools.filter((p) => p.length > 0)
  const firsts = filled.map((p) => p[0])
  const rest = shuffle(filled.flatMap((p) => p.slice(1)), random)
  const size = Math.min(REVIEW_MAX, Math.max(REVIEW_TARGET, firsts.length), firsts.length + rest.length)
  return shuffle([...firsts, ...rest].slice(0, size), random).map((q, i) => ({ ...q, id: `review-${i}-${q.id}` }))
}

/** The exercises this chapter has material for, in teaching order. */
export function chapterPracticeSets(content: ChapterContent): PracticeSet[] {
  const words = askable(content.words)
  const lines = spokenLines(content)
  const trueFalse = content.true_false ?? []
  const transforms = content.transforms ?? []
  const pictures = content.pictures ?? []
  const hasWords = words.length >= MIN_WORDS_FOR_ROUND
  const hasLines = lines.length >= OPTION_COUNT
  const wordSentences = content.word_sentences ?? []
  const vocabSizes = VOCAB_SIZES.filter((n) => n <= words.length)
  const defaultVocab = Math.min(VOCAB_SIZES[0], words.length)

  const sets: PracticeSet[] = []
  const add = (ok: boolean, set: PracticeSet) => {
    if (ok) sets.push(set)
  }
  add(hasWords, { id: 'vocab-meaning', group: 'Vocabulary', icon: 'translate', title: 'Word to English', summary: 'See the word, pick its meaning.', sizes: vocabSizes, build: (r = Math.random, n = defaultVocab) => meaningQuestions(words, r, n) })
  add(hasWords, { id: 'vocab-word', group: 'Vocabulary', icon: 'style', title: 'English to word', summary: 'See the meaning, pick the word.', sizes: vocabSizes, build: (r = Math.random, n = defaultVocab) => wordQuestions(words, r, n) })
  add(hasWords, { id: 'vocab-context', group: 'Vocabulary', icon: 'edit_note', title: 'Word in a sentence', summary: 'Drag each word into its blank.', wordBank: true, build: (r = Math.random) => (wordSentences.length > 0 ? wordSentenceQuestions(wordSentences, words, r) : contextQuestions(words, lines, r)) })
  add((content.gaps ?? []).length > 0, { id: 'check', group: 'Confirm', icon: 'unfold_more', title: 'Choose the word', summary: 'Pick the right particle or form.', build: (r = Math.random) => gapQuestions(content, r) })
  add(trueFalse.length > 0, { id: 'true-false', group: 'Confirm', icon: 'forum', title: 'True or false', summary: 'Read a short exchange and judge a statement.', build: (r = Math.random) => trueFalseQuestions(trueFalse, r) })
  add(hasLines, { id: 'listen', group: 'Confirm', icon: 'headphones', title: 'Listen and choose', summary: 'Hear a sentence, pick what it means.', build: (r = Math.random) => listenQuestions(lines, r) })
  add(pictures.length > 0, { id: 'picture', group: 'Confirm', icon: 'visibility', title: 'Look and choose', summary: 'Match the picture to the right word.', build: (r = Math.random) => pictureQuestions(pictures, r) })
  add(tileLines(lines).length > 0, { id: 'tiles', group: 'Construct', icon: 'swap_horiz', title: 'Put in order', summary: 'Tap the words into a sentence.', build: (r = Math.random) => tileQuestions(lines, r) })
  add(transforms.length > 0, { id: 'change', group: 'Construct', icon: 'tune', title: 'Change the form', summary: 'Make it negative, past, a request…', build: (r = Math.random) => transformQuestions(transforms, r) })
  add(writeQuestions(lines, Math.random).length > 0, { id: 'write', group: 'Construct', icon: 'draw', title: 'Write it', summary: 'Type the sentence in Japanese.', build: (r = Math.random) => writeQuestions(lines, r) })

  const parts = [...sets]
  const pools = (r: Random) => parts.map((s) => s.build(r))
  add(pools(Math.random).flat().length >= REVIEW_MIN, {
    id: 'review',
    group: 'Review',
    icon: 'checklist',
    title: 'Chapter review',
    summary: `${REVIEW_MIN}–${REVIEW_MAX} questions mixing everything above.`,
    build: (r = Math.random) => reviewQuestions(pools(r), r),
  })
  return sets
}
