import type { KanaChar } from '@/types'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import { kanaSpeechText } from '@/lib/content/kana/kanaMarks'

/** "すし (sushi)" -> "すし" */
const kanaOfSample = (word: string) => word.replace(/\s*\(.*\)\s*$/, '')

/**
 * Everything the kana course speaks: each kana (as the speaker buttons and
 * quizzes say it), its example word and the word-practice words. The texts
 * must equal what `speak()` is called with, or the saved clips will not match.
 */
export function kanaPackTexts(kana: readonly KanaChar[], script: Pick<KanaScriptConfig, 'sampleWords' | 'practiceWords'>): string[] {
  const texts = new Set<string>()
  for (const k of kana) {
    if (k.isEmpty) continue
    texts.add(k.character)
    texts.add(kanaSpeechText(k, script.sampleWords))
    const sample = script.sampleWords[k.id] ?? script.sampleWords[k.romaji]
    if (sample) texts.add(kanaOfSample(sample.word))
  }
  for (const w of script.practiceWords) texts.add(w.word)
  return [...texts]
}
