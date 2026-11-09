#!/usr/bin/env node
/**
 * Makes the Exercise tab's pictures once with Gemini, saves them in
 * public/exercises/n5/, and adds their questions to the API's content
 * (../FluentFox/content/exercises/n5.json), so "Look and choose" appears for
 * those chapters. Only pictures not made yet are generated.
 *
 *   node scripts/exercises/generate-images.mjs [--api-repo ../FluentFox]
 *
 * GEMINI_API_KEY comes from the environment or .env.local and is never
 * printed. macOS only (sips converts to JPEG).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const MODEL = 'gemini-3.1-flash-image'
const ASPECT = '4:3'
const WIDTH = '640'
const QUALITY = '72'
const OUT = 'public/exercises/n5'

const flag = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}
const contentFile = join(flag('api-repo', '../FluentFox'), 'content/exercises/n5.json')
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

const { style, pictures } = JSON.parse(readFileSync('scripts/exercises/pictures-n5.json', 'utf8'))
mkdirSync(OUT, { recursive: true })
const temp = mkdtempSync(join(tmpdir(), 'exercise-images-'))
for (const p of pictures) {
  const file = join(OUT, `${p.name}.jpg`)
  if (existsSync(file)) continue
  const raw = join(temp, `${p.name}.png`)
  writeFileSync(raw, await generate(`${p.scene} ${style}`))
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', QUALITY, '-Z', WIDTH, raw, '--out', file], { stdio: 'ignore' })
  console.log(`made ${file}`)
}

const content = JSON.parse(readFileSync(contentFile, 'utf8'))
for (const chapter of content.chapters) {
  chapter.pictures = pictures
    .filter((p) => p.chapter === chapter.slug)
    .map(({ image, alt, sentence, answer, options, translation }) => ({ image, alt, sentence, answer, options, translation }))
}
writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`)
console.log(`${pictures.length} picture questions added to ${contentFile}. Check the images before committing.`)
