/**
 * After `vite build`: writes one static HTML file per public page
 * (dist/<path>.html) with that page's own title, description,
 * canonical URL, Open Graph / Twitter tags, JSON-LD and a readable snapshot
 * of its content inside #root. The app replaces the snapshot when it starts
 * (createRoot clears the container), so people see the normal app; crawlers
 * that run little or no JavaScript (Bing and so Edge, DuckDuckGo, Yahoo, link
 * previews, AI assistants) see a real page instead of the home page's head
 * and an empty div.
 *
 * The untouched build is kept as dist/spa.html, marked noindex: vercel.json
 * serves it for every other path (account pages, unknown URLs), so those are
 * never indexed as copies of the home page.
 *
 *   vite-node scripts/seo/prerender.ts      (run by npm run build)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { SITE_NAME, SITE_URL } from '@/lib/seo/titles'
import { esc, seoRoutes, type SeoRoute } from './routes'

const DIST = path.resolve(import.meta.dirname, '../../dist')
const shell = readFileSync(path.join(DIST, 'index.html'), 'utf8')

/** Replaces exactly one match, so a changed index.html fails the build instead of shipping a wrong head. */
function replaceOnce(html: string, pattern: RegExp, value: string, what: string): string {
  const matches = html.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))
  if (!matches || matches.length !== 1) throw new Error(`prerender: expected one ${what} in dist/index.html, found ${matches?.length ?? 0}`)
  return html.replace(pattern, value)
}

const metaContent = (html: string, attr: 'name' | 'property', key: string, value: string) =>
  replaceOnce(html, new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`, `${attr}="${key}"`)

function breadcrumb(route: SeoRoute) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: SITE_NAME, path: '/' }, ...route.crumbs].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  }
}

// Plain, readable styling for the moment before the app renders (and for
// anyone without JavaScript); it inherits the site's colours and fonts.
const SNAPSHOT_STYLE = 'max-width:56rem;margin:0 auto;padding:96px 16px 48px;line-height:1.6'

function snapshot(route: SeoRoute): string {
  const crumbs = route.crumbs.length
    ? `<nav aria-label="Breadcrumb"><a href="/">${SITE_NAME}</a>${route.crumbs.map((c) => ` › <a href="${esc(c.path)}">${esc(c.name)}</a>`).join('')}</nav>`
    : ''
  return `<main data-prerendered style="${SNAPSHOT_STYLE}">${crumbs}<h1>${esc(route.h1)}</h1>${route.body}</main>`
}

function render(route: SeoRoute): string {
  const url = `${SITE_URL}${route.path}`
  let html = shell
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(route.title)}</title>`, '<title>')
  html = metaContent(html, 'name', 'description', route.description)
  html = metaContent(html, 'property', 'og:url', url)
  html = metaContent(html, 'property', 'og:title', route.title)
  html = metaContent(html, 'property', 'og:description', route.description)
  html = metaContent(html, 'name', 'twitter:url', url)
  html = metaContent(html, 'name', 'twitter:title', route.title)
  html = metaContent(html, 'name', 'twitter:description', route.description)

  const graph = [...route.jsonLd, ...(route.crumbs.length ? [breadcrumb(route)] : [])]
  const ld = graph.length
    // `<` is escaped so page text can never close the script element.
    ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`
    : ''
  html = replaceOnce(html, /<\/head>/, `<link rel="canonical" href="${esc(url)}" />${ld}</head>`, '</head>')
  html = replaceOnce(html, /<div id="root"><\/div>/, `<div id="root">${snapshot(route)}</div>`, '#root')
  return html
}

// The shell for every non-prerendered path: never indexed.
writeFileSync(
  path.join(DIST, 'spa.html'),
  replaceOnce(shell, /<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, follow" />', 'robots meta'),
)

const routes = seoRoutes()
for (const route of routes) {
  // One file per page: /kanji/n5/browse → dist/kanji/n5/browse.html, served at
  // the clean URL by vercel.json's cleanUrls (a /route/index.html folder can
  // lose to the app-wide rewrite). Home is dist/index.html. Kanji paths are
  // decoded, since the host looks files up by the decoded path.
  const parts = decodeURIComponent(route.path).split('/').filter(Boolean)
  const file = parts.length ? path.join(DIST, ...parts.slice(0, -1), `${parts[parts.length - 1]}.html`) : path.join(DIST, 'index.html')
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, render(route))
}
console.log(`prerender: ${routes.length} pages, plus dist/spa.html (noindex) for every other path`)
