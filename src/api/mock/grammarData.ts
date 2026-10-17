import type { GrammarChapter, GrammarChapterSummary } from '@/types/grammar';
import { grammarChapterIndex } from 'virtual:grammar-chapters';

/**
 * Grammar mock data, split so nothing heavy ships up front:
 * - the chapter LIST comes from `virtual:grammar-chapters` (frontmatter only,
 *   built from the .mdx files by `vite-plugins/grammarChapters.ts`);
 * - each chapter BODY is its own lazy chunk, fetched and parsed on request.
 *   The parser is loaded with the first chapter, not with the page.
 */

const GRAMMAR_DIR = '../../assets/grammar/';

/** One lazy loader per .mdx file, keyed by path relative to this module. */
const mdxLoaders = import.meta.glob<string>('../../assets/grammar/**/*.mdx', { query: '?raw', import: 'default' });

const chaptersByLevel = new Map<string, GrammarChapterSummary[]>();
const sourceByChapter = new Map<string, string>();
const chapterKey = (level: string, id: number) => `${level}/${id}`;

for (const { id, level, title, source } of grammarChapterIndex) {
  const list = chaptersByLevel.get(level) ?? [];
  list.push({ id, level, title });
  chaptersByLevel.set(level, list);
  // First file wins on a duplicate id, as the old sorted array lookup did.
  if (!sourceByChapter.has(chapterKey(level, id))) sourceByChapter.set(chapterKey(level, id), GRAMMAR_DIR + source);
}

/** Chapters of a level (sorted by id), or [] for a level with no content. */
export function getMockChapterList(level: string): GrammarChapterSummary[] {
  return chaptersByLevel.get(level.toLowerCase()) ?? [];
}

/** Parsed chapters (or in-flight loads), so each chapter is fetched and parsed once. */
const chapterCache = new Map<string, Promise<GrammarChapter | null>>();
const parsedChapters = new Map<string, GrammarChapter>();

/** A chapter already parsed in memory, or `undefined` if it hasn't been loaded yet. */
export function peekMockChapter(level: string, id: number): GrammarChapter | undefined {
  return parsedChapters.get(chapterKey(level.toLowerCase(), id));
}

/** Load and parse one chapter. Resolves `null` when the level has no such chapter. */
export function loadMockChapter(level: string, id: number): Promise<GrammarChapter | null> {
  const key = chapterKey(level.toLowerCase(), id);
  const cached = chapterCache.get(key);
  if (cached) return cached;

  const source = sourceByChapter.get(key);
  const load = source ? mdxLoaders[source] : undefined;
  if (!load) return Promise.resolve(null);

  const promise = Promise.all([load(), import('@/utils/mdxParser')]).then(([raw, { parseMdxToChapter }]) => {
    const chapter = parseMdxToChapter(raw);
    parsedChapters.set(key, chapter);
    return chapter;
  });
  // Don't cache failures (e.g. a chunk that failed to download), so a retry refetches.
  promise.catch(() => chapterCache.delete(key));
  chapterCache.set(key, promise);
  return promise;
}
