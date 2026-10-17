import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { KanjiEntry, KanjiLevelDetail, KanjiLevelId, KanjiLevelIndex, KanjiStrokeData } from '@/types/kanji'
import type { LearningPathState } from '@/api/services/learningPathService'
import { kanjiService } from '@/api/services/kanjiService'
import { getKanjiPath, type KanjiStage } from '@/api/services/kanjiProgressService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import { useItemLevels } from '@/hooks/useProgress'
import { KANJI_TRACK } from '@/lib/learn/paths'

/**
 * Kanji data + progress hooks. Pages and components read kanji only through
 * these (component → hook → kanjiService / kanjiProgressService).
 */

/** A level's light index (units, groups, rows). */
export function useKanjiLevelIndex(level: KanjiLevelId): AsyncState<KanjiLevelIndex> {
  return useAsync(`kanji-index-${level}`, () => kanjiService.getLevelIndex(level))
}

/** A level's full entries (lessons, quizzes, tests). */
export function useKanjiLevelDetail(level: KanjiLevelId): AsyncState<KanjiLevelDetail> {
  return useAsync(`kanji-detail-${level}`, () => kanjiService.getLevelDetail(level))
}

export interface KanjiLevelData {
  index: KanjiLevelIndex
  entries: KanjiEntry[]
  byChar: ReadonlyMap<string, KanjiEntry>
}

/** A level's index and full entries together (unit, quiz, test and practice pages). */
export function useKanjiLevelData(level: KanjiLevelId): AsyncState<KanjiLevelData> {
  return useAsync(`kanji-data-${level}`, async () => {
    const [index, detail] = await Promise.all([kanjiService.getLevelIndex(level), kanjiService.getLevelDetail(level)])
    return { index, entries: detail.entries, byChar: new Map(detail.entries.map((e) => [e.char, e])) }
  })
}

/** One kanji's full entry; `data` is null when no available level has it. */
export function useKanjiEntry(char: string): AsyncState<KanjiEntry | null> {
  return useAsync(`kanji-entry-${char}`, () => kanjiService.getKanji(char))
}

/** Every available level's index (Browse, reviews across levels). */
export function useAllKanjiIndexes(): AsyncState<KanjiLevelIndex[]> {
  return useAsync('kanji-indexes', async () => {
    const levels = await kanjiService.getLevels()
    return Promise.all(levels.filter((l) => l.status === 'available').map((l) => kanjiService.getLevelIndex(l.id)))
  })
}

type StrokeState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | { status: 'ready'; data: KanjiStrokeData }

/** KanjiVG strokes for one kanji (fetched per kanji, cached by the service). */
export function useKanjiStrokes(char: string): StrokeState & { retry: () => void } {
  const [state, setState] = useState<StrokeState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    kanjiService.getStrokes(char).then(
      (data) => !cancelled && setState(data ? { status: 'ready', data } : { status: 'missing' }),
      () => !cancelled && setState({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [char, attempt])

  const retry = useCallback(() => setAttempt((a) => a + 1), [])
  return { ...state, retry }
}

/**
 * A kanji's stage from the progress overview (N5, the only kanji track in
 * v1). Every kanji reads New for guests, while loading, and for other levels.
 */
export function useKanjiStage(): (char: string) => KanjiStage {
  return useItemLevels(KANJI_TRACK)
}

/** Live guided-path progress of one level (unit steps from the learn API for signed-in learners). */
export function useKanjiPath(level: KanjiLevelId): LearningPathState {
  const store = getKanjiPath(level)
  return useSyncExternalStore(store.subscribe, store.getState)
}

/**
 * Builds and downloads a unit's worksheet PDF (jsPDF and stroke data load on
 * demand). Rejects on failure so the caller can show an error.
 */
export async function downloadKanjiWorksheet(req: {
  levelTitle: string
  pdfSlug: string
  unit: KanjiLevelIndex['units'][number]
  unitNumber: number
  entries: KanjiEntry[]
}): Promise<void> {
  const HAN = /\p{Script=Han}/u
  const chars = new Set(req.entries.flatMap((e) => [e.char, ...[...(e.vocab.find((v) => v.isKey)?.word ?? '')].filter((c) => HAN.test(c))]))
  const loaded = await Promise.all([...chars].map(async (c) => [c, await kanjiService.getStrokes(c)] as const))
  const strokes: Record<string, KanjiStrokeData> = {}
  for (const [c, data] of loaded) if (data) strokes[c] = data
  const { generateKanjiWorksheet } = await import('@/lib/pdf')
  await generateKanjiWorksheet({ ...req, strokes })
}

/** Builds and downloads a level certificate (loads 漢 and 字 strokes for the heading). */
export async function downloadKanjiCertificate(req: {
  title: string
  levelLabel: string
  kanjiCount: number
  pdfSlug: string
  name: string
  score: number
  date: Date
}): Promise<void> {
  const strokes: Record<string, KanjiStrokeData> = {}
  for (const c of ['漢', '字']) {
    const data = await kanjiService.getStrokes(c)
    if (data) strokes[c] = data
  }
  const { generateKanjiCertificate } = await import('@/lib/pdf')
  await generateKanjiCertificate({ ...req, strokes })
}

/** Same as downloadKanjiWorksheet, loading the unit's entries from its level first (Downloads page). */
export async function downloadKanjiUnitWorksheet(req: {
  level: KanjiLevelId
  levelTitle: string
  pdfSlug: string
  unit: KanjiLevelIndex['units'][number]
  unitNumber: number
}): Promise<void> {
  const detail = await kanjiService.getLevelDetail(req.level)
  const byChar = new Map(detail.entries.map((e) => [e.char, e]))
  await downloadKanjiWorksheet({ ...req, entries: req.unit.kanji.flatMap((c) => byChar.get(c) ?? []) })
}
