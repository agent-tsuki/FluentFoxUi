/**
 * A chapter's vocab quiz and exercise come from the learn API (unit quizzes
 * on the vocab_n5 and grammar_n5 tracks). These helpers turn the server's
 * questions into the practice runner's questions (a dropdown in the sentence,
 * typed answers, multiple choice) and the runner's answers back into what the
 * server records. Pure.
 */
import { romajiToHiragana, hasLatin } from '@/lib/content/kanji/romaji'
import { SENTENCE_GAP } from '@/lib/learn/questionView'
import { choiceAnswer, typedAnswer, type GivenAnswer } from '@/lib/learn/practiceSession'
import type { TestQuestion } from '@/lib/testCenter/types'
import type { LearnQuestion, SessionStart } from '@/types/learn'

export interface ChapterQuestions {
  questions: TestQuestion[]
  /** The server question behind each runner question, by runner id. */
  cards: ReadonlyMap<string, LearnQuestion>
}

function gapPrompt(prompt: string): { type: 'gap'; before: string; after: string } {
  const at = prompt.indexOf(SENTENCE_GAP)
  return at === -1 ? { type: 'gap', before: prompt, after: '' } : { type: 'gap', before: prompt.slice(0, at), after: prompt.slice(at + SENTENCE_GAP.length) }
}

/** One server question as a runner question, or null for a type a chapter never asks. */
export function chapterTestQuestion(q: LearnQuestion, index: number): TestQuestion | null {
  const id = `${q.card_id}-${index}`
  const accepted = [q.correct_answer, ...(q.accepted_answers ?? [])]
  const sentence = { translation: q.sentence?.translation, explanation: q.sentence?.explanation }
  switch (q.question_type) {
    case 'vocab_meaning_mcq':
      return {
        id,
        format: 'vocab-meaning',
        kind: 'choice',
        instruction: 'What does this word mean?',
        prompt: { type: 'glyph', text: q.prompt, ja: true },
        answer: q.correct_answer,
        options: q.options ?? [],
        optionsJa: false,
      }
    case 'vocab_meaning_typed':
      return {
        id,
        format: 'kanji-typed-meaning',
        kind: 'text',
        instruction: 'Type the meaning of this word',
        prompt: { type: 'glyph', text: q.prompt, ja: true },
        answer: q.correct_answer,
        compare: 'meaning',
        accepted,
        placeholder: 'e.g. station',
      }
    case 'grammar_gap_mcq':
      return {
        id,
        format: 'grammar-gap',
        kind: 'select',
        instruction: 'Choose the word that fills the gap',
        prompt: gapPrompt(q.prompt),
        answer: q.correct_answer,
        options: q.options ?? [],
        ...sentence,
      }
    case 'grammar_gap_typed':
      return {
        id,
        format: 'grammar-typed',
        kind: 'text',
        instruction: 'Type the missing word (kana or romaji)',
        prompt: gapPrompt(q.prompt),
        answer: q.correct_answer,
        compare: 'japanese',
        accepted,
        placeholder: 'kana or romaji',
        ...sentence,
      }
    case 'grammar_translate_mcq':
      return {
        id,
        format: 'grammar-meaning',
        kind: 'choice',
        instruction: 'What does this sentence mean?',
        prompt: { type: 'sentence', text: q.prompt },
        answer: q.correct_answer,
        options: q.options ?? [],
        optionsJa: false,
        explanation: q.sentence?.explanation,
      }
    default:
      return null
  }
}

export function chapterTestQuestions(session: SessionStart): ChapterQuestions {
  const questions: TestQuestion[] = []
  const cards = new Map<string, LearnQuestion>()
  session.questions.forEach((q, i) => {
    const built = chapterTestQuestion(q, i)
    if (!built) return
    questions.push(built)
    cards.set(built.id, q)
  })
  return { questions, cards }
}

/**
 * What the server records for an answer. Typed Japanese goes as kana, the
 * way the server compares it: "de" is sent as で, and "wa" as わ (which the
 * server accepts for the particle は).
 */
export function chapterAnswer(question: TestQuestion, given: string): GivenAnswer {
  if (question.kind === 'tiles') return typedAnswer(given)
  if (question.kind !== 'text') return choiceAnswer(given, question.options)
  if (question.compare === 'japanese' && hasLatin(given)) return typedAnswer(romajiToHiragana(given.trim().toLowerCase()))
  return typedAnswer(given)
}
