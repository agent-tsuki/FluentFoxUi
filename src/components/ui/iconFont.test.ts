import { describe, expect, it } from 'vitest'
import indexHtml from '../../../index.html?raw'

// index.html loads only the Material Symbols listed in `icon_names` to keep the
// font small. Any other name renders as its raw text ("insights"), so every
// icon the source uses must be on that list.

// Generated content holds no icons and is large, so it is left out.
const SOURCES = import.meta.glob<string>(
  ['/src/**/*.{ts,tsx}', '!/src/**/*.test.ts', '!/src/**/generated/**'],
  { query: '?raw', import: 'default', eager: true },
)
const ICON_NAME = /^[a-z][a-z0-9_]*$/

// `<Icon name=…>`, any `icon=` / `trailingIcon=` prop or `icon:` key, and raw
// `material-symbols-outlined` spans.
const ICON_PROP = /\b(name|[a-zA-Z]*[iI]con[a-zA-Z]*)\s*[=:]\s*(\{[^}]*\}|'[^']*'|"[^"]*"|`[^`]*`|[^,\n}]+)/g
const ICON_SPAN = /material-symbols-outlined[^>]*>\s*([a-z][a-z0-9_]*)\s*</g
const STRING_LITERAL = /['"`]([a-z][a-z0-9_]*)['"`]/g
const ICON_ELEMENT_BEFORE = /<Icon\b[^>]*$/
const LOOKBEHIND_CHARS = 200

function loadedIcons(): Set<string> {
  const list = indexHtml.match(/icon_names=([a-z0-9_,]+)/)?.[1] ?? ''
  return new Set(list.split(','))
}

// In `state === 'busy' ? 'progress_activity' : 'download'` only the branches are
// icons; the compared value is not.
function isComparedValue(expr: string, index: number, length: number): boolean {
  const before = expr.slice(0, index).trimEnd()
  const after = expr.slice(index + length).trimStart()
  return before.endsWith('===') || before.endsWith('!==') || after.startsWith('?')
}

function iconsIn(source: string): string[] {
  const names: string[] = []
  for (const match of source.matchAll(ICON_PROP)) {
    const [, key, expr] = match
    const start = match.index ?? 0
    if (key === 'name' && !ICON_ELEMENT_BEFORE.test(source.slice(Math.max(0, start - LOOKBEHIND_CHARS), start))) continue
    for (const literal of expr.matchAll(STRING_LITERAL)) {
      if (!isComparedValue(expr, literal.index ?? 0, literal[0].length)) names.push(literal[1])
    }
  }
  for (const match of source.matchAll(ICON_SPAN)) names.push(match[1])
  return names.filter((name) => ICON_NAME.test(name))
}

describe('Material Symbols subset', () => {
  it('loads every icon the app uses', () => {
    const loaded = loadedIcons()
    const missing = new Set<string>()
    for (const [file, source] of Object.entries(SOURCES)) {
      for (const name of iconsIn(source)) {
        if (!loaded.has(name)) missing.add(`${name} (${file})`)
      }
    }
    expect([...missing].sort(), 'add these to icon_names in index.html').toEqual([])
  })
})
