import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { chapterHeaderFromFrontmatter, parseFrontmatter } from '../src/utils/mdxFrontmatter'

const VIRTUAL_ID = 'virtual:grammar-chapters'
const RESOLVED_ID = '\0' + VIRTUAL_ID

interface IndexEntry {
  id: number
  level: string
  title: string
  /** Path of the .mdx file relative to the grammar directory, POSIX-style (e.g. `n5/chapter-1.mdx`). */
  source: string
}

function listMdxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listMdxFiles(full)
    return entry.isFile() && entry.name.endsWith('.mdx') ? [full] : []
  })
}

function buildIndex(dir: string): IndexEntry[] {
  return listMdxFiles(dir)
    .map(file => {
      const { id, level, title } = chapterHeaderFromFrontmatter(parseFrontmatter(readFileSync(file, 'utf8')))
      return { id, level, title, source: path.relative(dir, file).split(path.sep).join('/') }
    })
    .sort((a, b) => a.level.localeCompare(b.level) || a.id - b.id || a.source.localeCompare(b.source))
}

function moduleCode(dir: string): string {
  return `export const grammarChapterIndex = ${JSON.stringify(buildIndex(dir))}\n`
}

/**
 * Exposes `virtual:grammar-chapters`: the grammar chapter list (id, level,
 * title, source file) read from each .mdx file's frontmatter at build/dev time.
 * Lets the sidebar render every chapter title without shipping any chapter
 * body; bodies are loaded per chapter by `src/api/mock/grammarData.ts`.
 * In dev, adding/removing a chapter or editing its frontmatter reloads the page.
 */
export function grammarChapters(grammarDir: string): Plugin {
  const dir = path.resolve(grammarDir)
  let lastCode = ''

  return {
    name: 'foxsensei-grammar-chapters',
    resolveId: id => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return undefined
      lastCode = moduleCode(dir)
      return lastCode
    },
    configureServer(server) {
      const onFileEvent = (file: string) => {
        if (!file.endsWith('.mdx') || !path.resolve(file).startsWith(dir + path.sep)) return
        if (moduleCode(dir) === lastCode) return // body-only edit: the list is unchanged
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', onFileEvent)
      server.watcher.on('unlink', onFileEvent)
      server.watcher.on('change', onFileEvent)
    },
  }
}
