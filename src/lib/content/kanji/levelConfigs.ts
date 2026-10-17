/**
 * Per-level course settings and bundled-data loaders (the kanji counterpart
 * of src/lib/content/kana/scripts.ts). Owned by Agent A after Phase 0.
 *
 * Today N5 loads the Phase-0 fixture and N4 an empty level; Agent A points
 * both at `generated/n5.json` / `generated/n4.json` (+ authored TS) with
 * `import()`, keeping the `cached()` wrapper.
 *
 * Coming-soon levels have no `bundled` loaders: `kanjiService` reports them
 * unavailable now and fetches them from the API later.
 */
import type { KanjiLevelId } from '@/types/kanji'
import type { KanjiBundledLoaders, KanjiLevelConfig } from '@/lib/content/kanji/courseTypes'
import { KANJI_UNIT_STEPS } from '@/lib/content/kanji/courseTypes'
import { kanjiLevelMeta, kanjiLevelPath } from '@/lib/content/kanji/levels'

/** Caches a lazy loader for the session; a failed load can be retried. */
function cached<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null
  return () => {
    if (!promise) {
      promise = load()
      promise.catch(() => {
        promise = null
      })
    }
    return promise
  }
}

const N5_BUNDLED: KanjiBundledLoaders = {
  loadIndex: cached(() => import('@/lib/content/kanji/fixture').then((m) => m.KANJI_FIXTURE_N5_INDEX)),
  loadDetail: cached(() => import('@/lib/content/kanji/fixture').then((m) => m.KANJI_FIXTURE_N5_DETAIL)),
}

/** Placeholder until generated N4 data lands: an available level with no units yet (UI shows its empty state). */
const N4_BUNDLED: KanjiBundledLoaders = {
  loadIndex: async () => ({ level: 'n4', units: [], groups: [], rows: [] }),
  loadDetail: async () => ({ level: 'n4', entries: [] }),
}

const BUNDLED: Partial<Record<KanjiLevelId, KanjiBundledLoaders>> = { n5: N5_BUNDLED, n4: N4_BUNDLED }

/** N5: 3 + 3 per unit; N4 and above: 4 + 4. */
const BATCH_SIZE: Record<KanjiLevelId, number> = { n5: 3, n4: 4, n3: 4, n2: 4, n1: 4 }

function levelConfig(id: KanjiLevelId): KanjiLevelConfig {
  const meta = kanjiLevelMeta(id)
  return {
    id,
    label: meta.label,
    title: meta.title,
    status: meta.status,
    basePath: kanjiLevelPath(id),
    steps: KANJI_UNIT_STEPS,
    batchSize: BATCH_SIZE[id],
    unitQuizPassMark: 0.9,
    skipPassMark: 0.9,
    skipSamplePerUnit: 2,
    levelTest: { questions: 50, minutes: 15, passMark: 0.8, typedShare: 0.4 },
    certificateTitle: `FoxSensei · ${meta.title}`,
    pdfSlug: `kanji-${id}`,
    storageKeys: {
      furigana: `ff-kanji-${id}-furigana-v1`,
      speedBest: `ff-kanji-${id}-speed-best-v1`,
    },
    bundled: BUNDLED[id],
  }
}

/** Every level's config (coming-soon levels included, without loaders). */
export const KANJI_LEVEL_CONFIGS: Readonly<Record<KanjiLevelId, KanjiLevelConfig>> = {
  n5: levelConfig('n5'),
  n4: levelConfig('n4'),
  n3: levelConfig('n3'),
  n2: levelConfig('n2'),
  n1: levelConfig('n1'),
}
