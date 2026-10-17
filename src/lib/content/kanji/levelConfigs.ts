/**
 * Per-level course settings and bundled-data loaders (the kanji counterpart
 * of src/lib/content/kana/scripts.ts).
 *
 * N5 and N4 load the generated JSON in src/lib/content/kanji/generated/
 * (built by scripts/kanji/build.py) with `import()`, so each level's data is
 * its own chunk: the light index first, the full detail only when a page needs it.
 *
 * Coming-soon levels have no `bundled` loaders: `kanjiService` reports them
 * unavailable now and fetches them from the API later.
 */
import type { KanjiLevelDetail, KanjiLevelId, KanjiLevelIndex } from '@/types/kanji'
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

// JSON imports are typed loosely (string unions widen to string), hence the casts.
const N5_BUNDLED: KanjiBundledLoaders = {
  loadIndex: cached(() => import('@/lib/content/kanji/generated/n5.index.json').then((m) => m.default as KanjiLevelIndex)),
  loadDetail: cached(() => import('@/lib/content/kanji/generated/n5.detail.json').then((m) => m.default as KanjiLevelDetail)),
}

const N4_BUNDLED: KanjiBundledLoaders = {
  loadIndex: cached(() => import('@/lib/content/kanji/generated/n4.index.json').then((m) => m.default as KanjiLevelIndex)),
  loadDetail: cached(() => import('@/lib/content/kanji/generated/n4.detail.json').then((m) => m.default as KanjiLevelDetail)),
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
