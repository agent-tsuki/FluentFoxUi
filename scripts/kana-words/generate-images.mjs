#!/usr/bin/env node
/**
 * Makes the Word builder practice pictures once with Gemini, one per word in
 * src/lib/content/kana/{practiceWords,katakanaWords}.ts, saved as
 *   public/images/kana/words/<script>/<romaji>.png
 * Only pictures not made yet are generated. Then upload them like every other
 * image (they leave the repo once the manifest has them):
 *   node --env-file=.env.local scripts/upload-assets/upload-assets.mjs
 *
 *   node scripts/kana-words/generate-images.mjs [--only neko,kamera]
 *
 * GEMINI_API_KEY comes from the environment or .env.local and is never printed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const MODEL = 'gemini-3.1-flash-image'
const ASPECT = '1:1'
const CONCURRENCY = 4
const OUT = 'public/images/kana/words'
const STYLE =
  'Simple friendly flat vector illustration for a language-learning app. Soft warm pastel colours with a muted terracotta accent, ' +
  'plain light cream background, one clear centred subject filling most of the frame, thick clean shapes, no outlines on the background. ' +
  'Absolutely no text, letters, numbers or writing anywhere.'

const SOURCES = [
  { script: 'hiragana', file: 'src/lib/content/kana/practiceWords.ts' },
  { script: 'katakana', file: 'src/lib/content/kana/katakanaWords.ts' },
]
// [word, romaji, meaning, emoji] tuples, as the word lists write them.
const ENTRY = /\[\s*'([^']+)',\s*'([a-z]+)',\s*'([^']+)',\s*'[^']*'\s*\]/g

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}
const only = flag('only')?.split(',')

const envFile = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : ''
const key = process.env.GEMINI_API_KEY ?? envFile.match(/^GEMINI_API_KEY=["']?([^"'\n]+)/m)?.[1]
if (!key) {
  console.error('Set GEMINI_API_KEY, or add it to .env.local.')
  process.exit(1)
}

async function generate(prompt) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: ASPECT } },
    }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`Gemini answered ${res.status}: ${body.error?.message ?? 'no message'}`)
  const image = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData
  if (!image) throw new Error('Gemini returned no image')
  return Buffer.from(image.data, 'base64')
}

const jobs = SOURCES.flatMap(({ script, file }) =>
  [...readFileSync(file, 'utf8').matchAll(ENTRY)].map(([, word, romaji, meaning]) => ({
    script,
    word,
    romaji,
    meaning,
    out: join(OUT, script, `${romaji}.png`),
  })),
).filter((j) => (!only || only.includes(j.romaji)) && !existsSync(j.out))

console.log(`${jobs.length} pictures to make`)
let failed = 0
async function worker() {
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    mkdirSync(join(OUT, job.script), { recursive: true })
    const prompt = `A picture of: ${job.meaning} (the Japanese word ${job.word}). ${STYLE}`
    try {
      writeFileSync(job.out, await generate(prompt))
      console.log(`made ${job.out}`)
    } catch (e) {
      failed += 1
      console.error(`failed ${job.romaji}: ${e.message}`)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
if (failed) {
  console.error(`${failed} failed; run again to retry only those.`)
  process.exit(1)
}
console.log('Done. Check the pictures, then upload them with scripts/upload-assets.')
