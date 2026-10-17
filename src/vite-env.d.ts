/// <reference types="vite/client" />

declare module '*.webp' {
  const src: string
  export default src
}

/** Grammar chapter list built from .mdx frontmatter by `vite-plugins/grammarChapters.ts`. */
declare module 'virtual:grammar-chapters' {
  export const grammarChapterIndex: ReadonlyArray<{
    id: number
    level: string
    title: string
    /** .mdx path relative to `src/assets/grammar`, e.g. `n5/chapter-1.mdx`. */
    source: string
  }>
}
