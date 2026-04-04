import { GrammarChapter } from '@/types/grammar';
import { parseMdxToChapter } from '@/utils/mdxParser';

// Use Vite's glob import to get all MDX files as raw strings
const mdxModules = import.meta.glob('../../assets/grammar/**/*.mdx', { query: '?raw', eager: true });

export const grammarData: Record<string, GrammarChapter[]> = {
  n5: [],
  n4: [],
  n3: [],
  n2: [],
  n1: []
};

for (const path in mdxModules) {
  const rawText = (mdxModules[path] as { default: string }).default;
  const chapter = parseMdxToChapter(rawText);
  if (grammarData[chapter.level]) {
    grammarData[chapter.level].push(chapter);
  } else {
    grammarData[chapter.level] = [chapter];
  }
}

// Ensure chapters are sorted by chapter ID
for (const level in grammarData) {
  grammarData[level].sort((a, b) => a.id - b.id);
}
