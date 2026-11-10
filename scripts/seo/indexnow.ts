/**
 * Tells IndexNow search engines (Bing, and through it Edge, DuckDuckGo and
 * Yahoo; also Yandex, Naver, Seznam) that FoxSensei's pages changed, so they
 * recrawl within minutes instead of days. Run after a deploy that changes
 * public pages:
 *
 *   npm run indexnow            (every sitemap URL)
 *   npm run indexnow -- /kanji/n5 /grammar/n5/3     (only these paths)
 *
 * The key is public by design: IndexNow checks that https://foxsensei.com/<key>.txt
 * holds it, which proves the request comes from the site owner. Google does
 * not use IndexNow; it reads the sitemap (submit it once in Search Console).
 */
import { SITE_URL } from '@/lib/seo/titles'
import { seoRoutes } from './routes'

const KEY = '1eac7f6ed86f9866f20788c0e2401535'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
/** IndexNow accepts up to 10,000 URLs per request. */
const BATCH = 10_000

const paths = process.argv.slice(2).filter((a) => a.startsWith('/'))
const urlList = (paths.length ? paths : seoRoutes().map((r) => r.path)).map((p) => `${SITE_URL}${p}`)

for (let i = 0; i < urlList.length; i += BATCH) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList: urlList.slice(i, i + BATCH) }),
  })
  // 200 and 202 both mean accepted; 403 means the key file is not live yet.
  console.log(`IndexNow: ${res.status} ${res.statusText} for ${Math.min(BATCH, urlList.length - i)} URLs`)
  if (!res.ok) process.exitCode = 1
}
