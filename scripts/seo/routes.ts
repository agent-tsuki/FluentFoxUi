/**
 * Every public, indexable page with what a search engine should see for it:
 * title, description, breadcrumbs, structured data and a readable HTML
 * snapshot of the page's content. Built only from the real course data, so
 * nothing here is invented.
 *
 * Read by generate-sitemap.ts (the URL list) and prerender.ts (one static
 * HTML file per page, for crawlers that run little or no JavaScript: Bing and
 * so Edge, DuckDuckGo and Yahoo, link previews and AI assistants).
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { HIRAGANA_UNITS } from '@/lib/content/kana/hiraganaUnits'
import { KATAKANA_UNITS } from '@/lib/content/kana/katakanaUnits'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { kanaBasePath } from '@/lib/content/kana/scriptIds'
import { KANJI_BASE, KANJI_LEVELS, availableKanjiLevels, kanjiLevelPath } from '@/lib/content/kanji/levels'
import { HOW_GRADING_WORKS_PATH } from '@/lib/learn/paths'
import {
  CLASSES_TITLE,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  grammarTitle,
  kanaPageTitle,
  kanjiPageTitle,
  kanjiTitle,
} from '@/lib/seo/titles'
import n5Index from '@/lib/content/kanji/generated/n5.index.json'
import n4Index from '@/lib/content/kanji/generated/n4.index.json'
import hiraganaStrokes from '@/assets/kana-strokes/hiragana.json'
import katakanaStrokes from '@/assets/kana-strokes/katakana.json'

const ROOT = path.resolve(import.meta.dirname, '../..')

export interface Crumb {
  name: string
  path: string
}

export interface SeoRoute {
  path: string
  priority: number
  changefreq: 'weekly' | 'monthly' | 'yearly'
  title: string
  /** 120–160 characters: what the search result shows under the title. */
  description: string
  h1: string
  /** Home is implied; the last crumb is this page. */
  crumbs: Crumb[]
  /** schema.org objects besides the breadcrumb, which is added for every page but home. */
  jsonLd: Record<string, unknown>[]
  /** Escaped HTML of the page's main content, shown until the app renders. */
  body: string
}

// ─── HTML helpers ────────────────────────────────────────────────────────────

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`
const p = (text: string) => `<p>${esc(text)}</p>`
const h2 = (text: string) => `<h2>${esc(text)}</h2>`
const ul = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`

// ─── Shared schema.org pieces ────────────────────────────────────────────────

export const ORG_ID = `${SITE_URL}/#organization`
const LOGO = `${SITE_URL}/favicon/web-app-manifest-512x512.png`

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: LOGO,
}

const provider = { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` }

function course(name: string, description: string, url: string, level: string, teaches: string) {
  return {
    '@type': 'Course',
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider,
    inLanguage: 'en',
    educationalLevel: level,
    teaches,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
  }
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface KanjiRow {
  char: string
  unitId: string
  meaning: string
  meanings: string[]
  keyReading: string
  readings: string[]
  strokes: number
}
interface KanjiUnitRow {
  id: string
  title: string
  summary: string
  kanji: string[]
}
interface KanjiIndex {
  units: KanjiUnitRow[]
  rows: KanjiRow[]
}
const KANJI_INDEX: Record<string, KanjiIndex> = { n5: n5Index, n4: n4Index }

const KANA_SCRIPTS = [
  { id: 'hiragana', label: 'Hiragana', units: HIRAGANA_UNITS, chars: Object.keys(hiraganaStrokes) },
  { id: 'katakana', label: 'Katakana', units: KATAKANA_UNITS, chars: Object.keys(katakanaStrokes) },
] as const

const kanaCount = (units: readonly KanaUnit[]) => units.reduce((n, u) => n + u.kanaIds.length, 0)

/** Grammar chapter files with their frontmatter and section headings. */
function grammarChapters() {
  const dir = path.join(ROOT, 'src/assets/grammar/n5')
  return readdirSync(dir)
    .map((file) => ({ file, n: Number(/^chapter-(\d+)\.mdx$/.exec(file)?.[1]) }))
    .filter((c) => Number.isInteger(c.n) && c.n > 0)
    .sort((a, b) => a.n - b.n)
    .map(({ file, n }) => {
      const src = readFileSync(path.join(dir, file), 'utf8')
      const front = /^---\n([\s\S]*?)\n---/.exec(src)?.[1] ?? ''
      const field = (key: string) => new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm').exec(front)?.[1] ?? ''
      const headings = [...src.matchAll(/^## (.+)$/gm)].map((m) => m[1].replace(/<[^>]+>/g, '').replace(/[*_`]/g, '').trim())
      return { n, title: field('title'), description: field('description'), headings }
    })
    // A placeholder chapter ("coming soon") is thin content: leave it out of
    // search until it is written, and it joins the sitemap on its own.
    .filter((c) => !/coming soon|^upcoming/i.test(`${c.title} ${c.description}`))
}

// ─── Routes ──────────────────────────────────────────────────────────────────

function staticRoutes(): SeoRoute[] {
  const site = (path: string, title: string, h1: string, description: string, priority: number, changefreq: SeoRoute['changefreq'], extra = ''): SeoRoute => ({
    path, title, h1, description, priority, changefreq, crumbs: path === '/' ? [] : [{ name: h1, path }], jsonLd: [], body: p(description) + extra,
  })
  const start = ul([
    link('/kana/hiragana/chart', 'Hiragana chart: every character with its reading'),
    link('/kana/hiragana/learn', 'Hiragana course: 13 short guided units'),
    link('/kana/katakana/learn', 'Katakana course: 15 short guided units'),
    link('/kanji/n5', 'JLPT N5 kanji: 79 kanji in 13 units'),
    link('/kanji/n4', 'JLPT N4 kanji: 166 kanji in 21 units'),
    link('/grammar/n5/1', 'JLPT N5 grammar: illustrated chapters'),
  ])
  const home = site(
    '/', HOME_TITLE, 'Learn Japanese, one small step at a time',
    'Learn to read Japanese free: hiragana and katakana courses, JLPT N5 and N4 kanji, illustrated N5 grammar and spaced-repetition reviews. No account needed to start.',
    1, 'weekly', h2('Start here') + start,
  )
  home.jsonLd = [
    ORGANIZATION,
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, inLanguage: 'en', publisher: { '@id': ORG_ID } },
  ]
  return [
    home,
    site('/classes', CLASSES_TITLE, 'Japanese classes', 'A hand-picked directory of Japanese courses on YouTube, Udemy and other sites, filtered by JLPT level from N5 to N1, with free options marked.', 0.6, 'weekly'),
    site(HOW_GRADING_WORKS_PATH, `How Spaced-Repetition Reviews Are Graded | ${SITE_NAME}`, 'How review and grading work', 'How FoxSensei grades your answers and decides when each kana, kanji and word comes back for review, so you study just before you would forget.', 0.4, 'yearly'),
    site('/about', `About ${SITE_NAME}: A Calm Way to Learn to Read Japanese`, `About ${SITE_NAME}`, 'FoxSensei is a calm, structured web app for learning to read Japanese, from your first hiragana to JLPT N4 kanji, with graded spaced-repetition reviews.', 0.4, 'yearly'),
    site('/terms', `Terms of Service | ${SITE_NAME}`, 'Terms of Service', 'The terms for using FoxSensei, the Japanese learning web app: your account, acceptable use, content and how the service may change.', 0.2, 'yearly'),
    site('/privacy', `Privacy Policy | ${SITE_NAME}`, 'Privacy Policy', 'What FoxSensei collects to run your account and reviews, how it is stored and protected, and the choices you have over your data.', 0.2, 'yearly'),
  ]
}

function kanaRoutes(): SeoRoute[] {
  const out: SeoRoute[] = []
  for (const script of KANA_SCRIPTS) {
    const base = kanaBasePath(script.id)
    const name = script.label
    const count = kanaCount(script.units)
    const counts = { kanaCount: count, unitCount: script.units.length }
    const courseCrumb = { name, path: `${base}/learn` }
    const unitList = ul(script.units.map((u, i) => `<strong>${esc(`Unit ${i + 1}: ${u.title}`)}</strong>: ${esc(u.summary)} (${esc(u.kanaIds.join(', '))})`))
    const courseLinks = ul([
      link(`${base}/chart`, `${name} chart`),
      link(`${base}/learn`, `Learn ${name}`),
      link(`${base}/tests`, `${name} quizzes and tests`),
      link(`${base}/downloads`, `Printable ${name} chart and worksheets`),
    ])

    const learnDescription = `Learn all ${count} ${name.toLowerCase()} free in ${script.units.length} short guided units: hear each kana, see its stroke order, practise with games and pass a quiz.`
    out.push({
      path: `${base}/learn`, priority: 0.9, changefreq: 'monthly',
      title: kanaPageTitle(name, 'course', counts), h1: `Learn ${name}`, description: learnDescription,
      crumbs: [courseCrumb],
      jsonLd: [course(`${name} for beginners`, learnDescription, `${base}/learn`, 'Beginner', `Reading and writing ${name.toLowerCase()}`)],
      body: p(learnDescription) + h2(`The ${script.units.length} ${name.toLowerCase()} units`) + unitList + h2(`More ${name}`) + courseLinks,
    })
    out.push({
      path: `${base}/chart`, priority: 0.9, changefreq: 'monthly',
      title: kanaPageTitle(name, 'chart', counts), h1: `${name} chart`,
      description: `The complete ${name.toLowerCase()} chart: all ${count} characters with romaji, audio and stroke order, from the five vowels to dakuten and combinations.`,
      crumbs: [courseCrumb, { name: 'Chart', path: `${base}/chart` }], jsonLd: [],
      body: p(`Every ${name.toLowerCase()} character with its reading. Tap one in the app to hear it and see how it is written.`)
        + `<p lang="ja">${esc(script.chars.join(' '))}</p>` + h2(`Learn ${name} unit by unit`) + unitList + courseLinks,
    })
    out.push({
      path: `${base}/tests`, priority: 0.5, changefreq: 'monthly',
      title: kanaPageTitle(name, 'tests', counts), h1: `${name} quizzes and tests`,
      description: `Check your ${name.toLowerCase()}: a short quiz for each unit, test-outs for what you already know, and a final test that earns a certificate.`,
      crumbs: [courseCrumb, { name: 'Tests', path: `${base}/tests` }], jsonLd: [],
      body: p(`A quiz for each of the ${script.units.length} units, test-outs for each group of kana, and a final ${name.toLowerCase()} test with a certificate.`) + courseLinks,
    })
    out.push({
      path: `${base}/downloads`, priority: 0.6, changefreq: 'monthly',
      title: kanaPageTitle(name, 'downloads', counts), h1: `Printable ${name} chart and worksheets`,
      description: `Free printable ${name.toLowerCase()} chart posters and an A4 practice worksheet for each of the ${script.units.length} units, as PDFs to print or save.`,
      crumbs: [courseCrumb, { name: 'Printables', path: `${base}/downloads` }], jsonLd: [],
      body: p(`Chart posters and one worksheet per unit, free to print.`) + unitList + courseLinks,
    })
  }
  return out
}

function kanjiRoutes(): SeoRoute[] {
  const out: SeoRoute[] = []
  for (const levelId of availableKanjiLevels()) {
    const index = KANJI_INDEX[levelId]
    if (!index) throw new Error(`No kanji index for available level "${levelId}"; add it to KANJI_INDEX in scripts/seo/routes.ts`)
    const level = KANJI_LEVELS.find((l) => l.id === levelId)
    const label = level?.label ?? levelId.toUpperCase()
    const base = kanjiLevelPath(levelId)
    const n = index.rows.length
    const unitsById = new Map(index.units.map((u) => [u.id, u]))
    const levelCrumb = { name: `JLPT ${label} kanji`, path: base }
    const kanjiLink = (r: KanjiRow) => `${link(`${KANJI_BASE}/${encodeURIComponent(r.char)}`, r.char)} ${esc(r.meaning)} (${esc(r.keyReading)})`
    const unitList = ul(index.units.map((u, i) => `<strong>${esc(`Unit ${i + 1}: ${u.title}`)}</strong>: ${esc(u.summary)} <span lang="ja">${esc(u.kanji.join(' '))}</span>`))
    const levelLinks = ul([
      link(base, `JLPT ${label} kanji course`),
      link(`${base}/browse`, `All ${label} kanji with meanings`),
      link(`${base}/tests`, `${label} kanji quizzes and level test`),
      link(`${base}/downloads`, `${label} kanji worksheets`),
    ])

    const courseDescription = `Learn all ${n} JLPT ${label} kanji free in ${index.units.length} short units, with meanings, readings, stroke order, example words, practice and quizzes.`
    out.push({
      path: base, priority: 0.9, changefreq: 'monthly',
      title: kanjiPageTitle(label, 'course', n), h1: `JLPT ${label} kanji`, description: courseDescription,
      crumbs: [levelCrumb],
      jsonLd: [course(`JLPT ${label} kanji`, courseDescription, base, `JLPT ${label}`, `The ${n} kanji of JLPT ${label}`)],
      body: p(courseDescription) + h2(`The ${index.units.length} units`) + unitList + levelLinks,
    })
    out.push({
      path: `${base}/browse`, priority: 0.6, changefreq: 'monthly',
      title: kanjiPageTitle(label, 'browse', n), h1: `All JLPT ${label} kanji`,
      description: `The full JLPT ${label} kanji list: all ${n} kanji with English meanings, on and kun readings and stroke counts. Open any kanji for stroke order and words.`,
      crumbs: [levelCrumb, { name: 'Browse', path: `${base}/browse` }], jsonLd: [],
      body: p(`Every JLPT ${label} kanji with its main meaning and reading.`) + ul(index.rows.map(kanjiLink)) + levelLinks,
    })
    out.push({
      path: `${base}/tests`, priority: 0.5, changefreq: 'monthly',
      title: kanjiPageTitle(label, 'tests', n), h1: `JLPT ${label} kanji quizzes and test`,
      description: `Test your JLPT ${label} kanji: a quiz for each of the ${index.units.length} units, test-outs, and a 50-question level test that earns a certificate.`,
      crumbs: [levelCrumb, { name: 'Tests', path: `${base}/tests` }], jsonLd: [],
      body: p(`Unit quizzes, test-outs and the level test for your certificate.`) + levelLinks,
    })
    out.push({
      path: `${base}/downloads`, priority: 0.5, changefreq: 'monthly',
      title: kanjiPageTitle(label, 'downloads', n), h1: `JLPT ${label} kanji worksheets`,
      description: `Free printable JLPT ${label} kanji worksheets: a trace-and-write PDF for each of the ${index.units.length} units, to practise stroke order on paper.`,
      crumbs: [levelCrumb, { name: 'Worksheets', path: `${base}/downloads` }], jsonLd: [],
      body: p(`A trace-and-write worksheet for each unit.`) + unitList + levelLinks,
    })

    for (const row of index.rows) {
      const unit = unitsById.get(row.unitId)
      const pagePath = `${KANJI_BASE}/${encodeURIComponent(row.char)}`
      const readings = row.readings.join(', ')
      const siblings = index.rows.filter((r) => r.unitId === row.unitId && r.char !== row.char)
      const description = `${row.char} means “${row.meanings.slice(0, 2).join('; ')}”. Readings: ${readings}. JLPT ${label} kanji, ${row.strokes} stroke${row.strokes === 1 ? '' : 's'}, with stroke order and example words.`
      out.push({
        path: pagePath, priority: 0.6, changefreq: 'monthly',
        title: kanjiTitle(row.char, row.meaning), h1: `${row.char}: ${row.meaning}`,
        description: description.length > 165 ? `${description.slice(0, 162).trimEnd()}…` : description,
        crumbs: [levelCrumb, { name: row.char, path: pagePath }],
        jsonLd: [{
          '@type': 'DefinedTerm',
          name: row.char,
          description: row.meanings.join('; '),
          inLanguage: 'ja',
          url: `${SITE_URL}${pagePath}`,
          inDefinedTermSet: { '@type': 'DefinedTermSet', name: `JLPT ${label} kanji`, url: `${SITE_URL}${base}/browse` },
        }],
        body: `<dl><dt>Meaning</dt><dd>${esc(row.meanings.join('; '))}</dd><dt>Readings</dt><dd lang="ja">${esc(readings)}</dd>`
          + `<dt>Strokes</dt><dd>${row.strokes}</dd><dt>Level</dt><dd>JLPT ${esc(label)}${unit ? `, ${esc(unit.title)}` : ''}</dd></dl>`
          + (siblings.length ? h2(unit ? `More kanji in ${unit.title}` : 'Related kanji') + ul(siblings.map(kanjiLink)) : '')
          + levelLinks,
      })
    }
  }
  return out
}

function grammarRoutes(): SeoRoute[] {
  const chapters = grammarChapters()
  return chapters.map((c, i) => {
    const pagePath = `/grammar/n5/${c.n}`
    const prev = chapters[i - 1]
    const next = chapters[i + 1]
    const description = c.description || `JLPT N5 grammar chapter ${c.n}: ${c.title}, with illustrated notes, example sentences, vocabulary and a quiz.`
    return {
      path: pagePath, priority: c.n === 1 ? 0.9 : 0.7, changefreq: 'monthly' as const,
      title: grammarTitle('N5', c.n, c.title), h1: `Chapter ${c.n}: ${c.title}`,
      description: description.length > 165 ? `${description.slice(0, 162).trimEnd()}…` : description,
      crumbs: [{ name: 'JLPT N5 grammar', path: '/grammar/n5/1' }, { name: `Chapter ${c.n}`, path: pagePath }],
      jsonLd: [{
        '@type': 'LearningResource',
        name: `JLPT N5 grammar ${c.n}: ${c.title}`,
        description,
        url: `${SITE_URL}${pagePath}`,
        learningResourceType: 'Lesson',
        educationalLevel: 'JLPT N5',
        inLanguage: 'en',
        isAccessibleForFree: true,
        provider,
      }],
      body: p(description)
        + (c.headings.length ? h2('In this chapter') + ul(c.headings.map(esc)) : '')
        + ul([
          ...(prev ? [link(`/grammar/n5/${prev.n}`, `Previous: chapter ${prev.n}, ${prev.title}`)] : []),
          ...(next ? [link(`/grammar/n5/${next.n}`, `Next: chapter ${next.n}, ${next.title}`)] : []),
        ])
        + h2('All N5 grammar chapters') + ul(chapters.map((o) => link(`/grammar/n5/${o.n}`, `${o.n}. ${o.title}`))),
    }
  })
}

/** Every indexable page, de-duplicated by path, home first. */
export function seoRoutes(): SeoRoute[] {
  const seen = new Set<string>()
  return [...staticRoutes(), ...kanaRoutes(), ...kanjiRoutes(), ...grammarRoutes()].filter((r) => !seen.has(r.path) && seen.add(r.path))
}
