/**
 * Grammar-chapter frontmatter helpers, shared by the full MDX parser
 * (`mdxParser.ts`, loaded with each chapter) and the build-time chapter index
 * (`vite-plugins/grammarChapters.ts`, which runs in Node).
 *
 * Must stay dependency-free (no `@/` imports): Vite's config bundler loads it.
 */

/** `$…$` with no whitespace just inside the delimiters (so prices like "$5 or $10" are left alone). */
export const MATH_PATTERN = /\$(?=\S)([^$\n]*?\S)\$/g

export const SUBSCRIPT_RE = /([A-Za-z])_(?:\{([A-Za-z0-9]+)\}|([A-Za-z0-9]+))/g

export function stripTex(expr: string): string {
  return expr
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(?:quad|qquad|,|;|!)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const UNICODE_SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ',
  p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
}

/** `$N_1$` → `N₁` for plain-text fields (titles, translations). */
export function mathToPlain(text: string): string {
  return text.replace(MATH_PATTERN, (_, expr: string) =>
    stripTex(expr).replace(SUBSCRIPT_RE, (m, base: string, braced?: string, bare?: string) => {
      const sub = braced ?? bare ?? ''
      const chars = [...sub].map((c) => UNICODE_SUBSCRIPTS[c])
      return chars.every(Boolean) ? base + chars.join('') : m
    }),
  )
}

export function parseFrontmatter(text: string): Record<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const block = match[1]
  const fm: Record<string, string> = {}
  block.split('\n').forEach(line => {
    const colon = line.indexOf(':')
    if (colon > -1) {
      const key = line.slice(0, colon).trim()
      const val = line.slice(colon + 1).trim().replace(/^"|"$/g, '')
      fm[key] = val
    }
  })
  return fm
}

/** What the chapter list needs from a chapter: derived from frontmatter only. */
export interface ChapterHeader {
  id: number
  level: string
  title: string
  description: string
}

/**
 * id / level / title / description of a chapter from its frontmatter, with the
 * same fallbacks the parser has always used. The single source of these values
 * for both the chapter index and the parsed chapter.
 */
export function chapterHeaderFromFrontmatter(fm: Record<string, string | undefined>): ChapterHeader {
  return {
    id: parseInt(fm.chapter ?? '', 10) || 1,
    level: (fm.level || 'n5').toLowerCase(),
    title: mathToPlain(fm.title || 'Untitled Phase'),
    description: mathToPlain(fm.description || ''),
  }
}
