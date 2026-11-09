import { useAsync, type AsyncState } from '@/hooks/useAsync'
import { kanjiService } from '@/api/services/kanjiService'
import { grammarService } from '@/api/services/grammarService'
import { KANA_SCRIPTS } from '@/lib/content/kana/scripts'
import { KANA_SCRIPT_IDS, type RegisteredKanaScriptId } from '@/lib/content/kana/scriptIds'
import { KANJI_LEVELS, isKanjiLevelId } from '@/lib/content/kanji/levels'
import { GRAMMAR_LEVELS } from '@/components/grammar/LevelSwitcher'
import { GRAMMAR_TEST_LEVELS, type LevelOption } from '@/lib/testCenter/subjects'
import { grammarSource, kanaSource, kanjiSource, vocabSource, type TestSource } from '@/lib/testCenter/sources'
import type { TestSubjectId } from '@/lib/testCenter/types'

/** The levels (or kana scripts) a subject can be tested at. */
export function levelOptions(subject: TestSubjectId): LevelOption[] {
  switch (subject) {
    case 'kana':
      return KANA_SCRIPT_IDS.map((id) => ({ id, label: KANA_SCRIPTS[id].label, native: KANA_SCRIPTS[id].nativeLabel, available: true }))
    case 'grammar':
      return GRAMMAR_LEVELS.map((id) => ({ id, label: id.toUpperCase(), available: GRAMMAR_TEST_LEVELS.includes(id) }))
    default:
      return KANJI_LEVELS.map((l) => ({ id: l.id, label: l.label, available: l.status === 'available' }))
  }
}

async function loadSource(subject: TestSubjectId, level: string): Promise<TestSource> {
  if (subject === 'kana') {
    const script = KANA_SCRIPTS[level as RegisteredKanaScriptId]
    if (!script) throw new Error(`Unknown kana script: ${level}`)
    const sections = await script.loadSections()
    const all = sections.flatMap((s) => s.chars).filter((c) => !c.isEmpty)
    return kanaSource(script.units, script.groups, all, script.lookAlikes)
  }
  if (subject === 'grammar') {
    const [chapters, { GRAMMAR_QUESTION_BANK }] = await Promise.all([
      grammarService.listChapters(level),
      import('@/lib/content/grammar/questionBank'),
    ])
    return grammarSource(chapters, GRAMMAR_QUESTION_BANK[level] ?? [])
  }
  if (!isKanjiLevelId(level)) throw new Error(`Unknown kanji level: ${level}`)
  const [index, detail] = await Promise.all([kanjiService.getLevelIndex(level), kanjiService.getLevelDetail(level)])
  const byChar = new Map(detail.entries.map((e) => [e.char, e]))
  return subject === 'kanji' ? kanjiSource(index, detail.entries, byChar) : vocabSource(index, detail.entries, byChar)
}

/** A subject's testable content at one level (scope groups + a question builder), loaded on demand. */
export function useTestSource(subject: TestSubjectId, level: string): AsyncState<TestSource> {
  return useAsync(`test-source/${subject}/${level}`, () => loadSource(subject, level))
}
