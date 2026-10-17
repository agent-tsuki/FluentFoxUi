import type { KanaChar } from '@/types'
import type { KanaPracticeWord, KanaScriptConfig } from '@/lib/content/kana/scripts'
import { isKanaMark, isTypeableKana } from '@/lib/content/kana/kanaMarks'
import { pickOptions, shuffle, type Confusables } from '@/components/practice/listen/pickOptions'
import { buildMarkQuestion } from './markQuestions'
import type { QuestionKind, QuizQuestion } from './types'

/** Kana that are pronounced the same, so they can't both be options in a listening question. */
const SOUND_ALIKE: Record<string, string[]> = {
  o: ['wo'], wo: ['o', 'who'], who: ['wo'], ji: ['dji'], dji: ['ji'], zu: ['dzu'], dzu: ['zu'],
  // Katakana's v-sounds are often said as b-sounds.
  ba: ['va'], va: ['ba'], bi: ['vi'], vi: ['bi'], bu: ['vu'], vu: ['bu'], be: ['ve'], ve: ['be'], bo: ['vo'], vo: ['bo'],
}

const KIND_CYCLE: QuestionKind[] = ['read', 'find', 'listen']

export interface BuildOptions {
  /** False when the browser can't speak: listening questions become reading ones. */
  speech: boolean
  /** The script's words: ー and ッ are asked through them (see markQuestions.ts). Without words they're left out. */
  words?: readonly KanaPracticeWord[]
  /** The script's look-alikes, tried first as distractors (defaults to the hiragana ones). */
  lookAlikes?: Confusables
}

/** Build options for a script: its words (for ー/ッ) and look-alikes. */
export function quizOptionsFor(script: KanaScriptConfig, speech: boolean): BuildOptions {
  return { speech, words: script.practiceWords, lookAlikes: script.lookAlikes }
}

/**
 * One question per target, with the three kinds spread evenly and shuffled.
 * Distractors come from `all` kana of the same type (basic / dakuten / compound),
 * look-alikes first, so short units still get four plausible options.
 * The first question is never a listening one: on a direct page load the
 * browser blocks speech until the learner has tapped something.
 *
 * Katakana's ー and small ッ can't be read on their own, so they never appear
 * as options, and a target that is one of them becomes a loanword question.
 */
export function buildQuestions(targets: KanaChar[], all: KanaChar[], { speech, words = [], lookAlikes }: BuildOptions): QuizQuestion[] {
  const usable = targets.filter((t) => isTypeableKana(t) || (isKanaMark(t) && words.length > 0))
  const quizzable = all.filter(isTypeableKana)
  const usedWords = new Set<string>()
  const kinds = shuffle(usable.map((_, i) => KIND_CYCLE[i % KIND_CYCLE.length] ?? 'read'))
  if (kinds[0] === 'listen') {
    const j = kinds.findIndex((k) => k !== 'listen')
    if (j > 0) [kinds[0], kinds[j]] = [kinds[j] ?? 'read', 'listen']
  }

  return usable.flatMap((target, i) => {
    const wanted = kinds[i] ?? 'read'
    const kind: QuestionKind = wanted === 'listen' && !speech ? 'read' : wanted
    const key = `${i}-${target.id}`
    if (isKanaMark(target)) {
      const question = buildMarkQuestion(target, kind, key, all, words, usedWords)
      return question ? [question] : []
    }
    const alike = kind === 'listen' ? (SOUND_ALIKE[target.id] ?? []) : []
    const pool = quizzable.filter((k) => k.type === target.type && !alike.includes(k.id))
    return [{ key, kind, target, options: pickOptions(target, pool, 4, lookAlikes) }]
  })
}

/**
 * `count` targets drawn from `kana`: shuffled passes over the set, repeated
 * when the set is smaller than `count`, never the same kana twice in a row.
 */
export function drawTargets(kana: KanaChar[], count: number): KanaChar[] {
  if (kana.length === 0) return []
  const out: KanaChar[] = []
  while (out.length < count) {
    const pass = shuffle(kana)
    const last = out[out.length - 1]
    if (last && pass.length > 1 && pass[0]?.id === last.id) pass.push(pass.shift() as KanaChar)
    out.push(...pass)
  }
  return out.slice(0, count)
}
