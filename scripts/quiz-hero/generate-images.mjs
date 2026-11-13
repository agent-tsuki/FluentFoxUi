#!/usr/bin/env node
/**
 * Makes the practice tests (/quiz) header illustration once with Gemini, in a
 * light (dawn) and a dark (moonlit) version, saved as
 *   public/images/quiz/hero-light.png
 *   public/images/quiz/hero-dark.png
 * Only versions not made yet are generated (delete one to remake it). Then
 * upload them like every other image:
 *   node --env-file=.env.local scripts/upload-assets/upload-assets.mjs
 *
 *   node scripts/quiz-hero/generate-images.mjs [--only light|dark]
 *
 * GEMINI_API_KEY comes from the environment or .env.local and is never printed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const MODEL = 'gemini-3.1-flash-image'
const ASPECT = '21:9'
const OUT = 'public/images/quiz'

const SCENE =
  'Wide panoramic landscape banner for a Japanese-learning app: Mount Fuji with a snow cap rising over a calm lake, ' +
  'its soft reflection in the water, a small five-storey pagoda on the right shore, cherry blossom branches entering ' +
  'from the top-right and top-left corners with a few petals drifting. The left 40% of the frame is open, calm sky and ' +
  'water with little detail, so a title can sit over it. Simple flat vector illustration, thick clean shapes, gentle ' +
  'gradients, soft and minimal, premium and quiet. Absolutely no text, letters, numbers, signatures or writing anywhere.'

const VERSIONS = {
  light:
    'Dawn: pale warm cream and peach sky, a soft rising sun glowing behind the mountain, muted terracotta and blush pink ' +
    'blossom, misty blue-grey hills, light airy palette.',
  dark:
    'Night: deep indigo and navy sky with a pale full moon glowing behind the mountain, a few faint stars, moonlit ' +
    'silver snow, dusky rose blossom, dark teal water with a moonlight shimmer, low contrast and calm.',
}

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}
const only = flag('only')

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

mkdirSync(OUT, { recursive: true })
const jobs = Object.entries(VERSIONS).filter(
  ([name]) => (!only || only === name) && !existsSync(join(OUT, `hero-${name}.png`)),
)
console.log(`${jobs.length} pictures to make`)
let failed = 0
await Promise.all(
  jobs.map(async ([name, mood]) => {
    const out = join(OUT, `hero-${name}.png`)
    try {
      writeFileSync(out, await generate(`${SCENE} ${mood}`))
      console.log(`made ${out}`)
    } catch (e) {
      failed += 1
      console.error(`failed ${name}: ${e.message}`)
    }
  }),
)
if (failed) {
  console.error(`${failed} failed; run again to retry only those.`)
  process.exit(1)
}
console.log('Done. Check the pictures, then upload them with scripts/upload-assets.')
