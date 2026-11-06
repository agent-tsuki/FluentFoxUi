#!/usr/bin/env node
/**
 * Generates the 10 built-in avatars (5 men, 5 women) with Gemini as
 * anime character portraits, each with its own personality. All prompts live in this file.
 *
 * Ids and public paths stay the same (men-warrior → /avatars/men/warrior.png …),
 * because the API returns those paths, so users keep the avatar they chose.
 * Where the files live in R2 (avatars/presets/{male,female}/) is decided by
 * scripts/upload-assets, which uploads them like every other image.
 *
 * Setup (once):
 *   cd scripts/generate-avatars && npm install && cd ../..
 *
 * 1. Generate (run from FluentFoxUi/, keys in the git-ignored .env.local):
 *   node --env-file=.env.local scripts/generate-avatars/generate-avatars.mjs
 *   → public/avatars/{men,women}/*.png (512px) and scripts/generate-avatars/out/preview.png
 *
 * 2. Upload what you approved, then commit src/lib/assetManifest.json and deploy:
 *   node --env-file=.env.local scripts/upload-assets/upload-assets.mjs
 *   Then delete public/avatars/ again: images live only on the CDN, not in the repo.
 *
 * 3. Once that frontend is live, remove the old files from R2:
 *   node --env-file=.env.local scripts/upload-assets/upload-assets.mjs --prune
 *
 * Options:
 *   --only men-warrior,women-casual-1   regenerate just these (the first avatar is the style reference)
 *   --preview                           only rebuild the preview sheet
 *   GEMINI_IMAGE_MODEL=...              override the model (default gemini-3-pro-image)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { GoogleGenAI } from '@google/genai'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(SCRIPT_DIR, '../..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const OUT_DIR = path.join(SCRIPT_DIR, 'out')

// Images are not kept in the repo; when a file isn't in public/, use its CDN copy.
const CDN_URL = 'https://cdn.foxsensei.com'
async function readPublicOrCdn(publicPath) {
  try {
    return await readFile(path.join(ROOT, 'public', publicPath))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  const manifest = JSON.parse(await readFile(path.join(ROOT, 'src/lib/assetManifest.json'), 'utf8'))
  const key = manifest[publicPath]
  if (!key) throw new Error(`${publicPath} is neither in public/ nor in the asset manifest`)
  const res = await fetch(`${CDN_URL}/${key}`)
  if (!res.ok) throw new Error(`could not download ${key} (${res.status})`)
  return Buffer.from(await res.arrayBuffer())
}

// Gemini 3 Pro Image ("Nano Banana Pro"): Google's highest-quality image model.
const DEFAULT_MODEL = 'gemini-3-pro-image'
const GENERATE_SIZE = '1K'
const ATTEMPTS = 3
const RETRY_DELAY_MS = 4000

// 512px source; scripts/upload-assets serves it as a 256px WebP (2x the largest avatar on screen).
const SOURCE_PX = 512

const STYLE = [
  'A profile avatar for FoxSensei, a premium app for learning Japanese.',
  'Style: polished modern anime character art, like key visual art from a high-budget anime series or a gacha game character card:',
  'crisp clean lineart, rich cel shading with soft gradients, glossy detailed hair with highlights, expressive detailed eyes,',
  'dramatic cinematic lighting with a strong coloured rim light. Attractive, stylish and charismatic character design.',
  'The personality must read instantly from the expression, pose, hair and outfit: confident, full of attitude.',
  'Composition: one character, head and shoulders, centred, the face in the middle of the image, a slight head tilt or angle allowed.',
  'Leave an even margin around the head and hair so everything fits inside a circular crop; shoulders reach the bottom edge.',
  'Background: one flat colour filling the whole square edge to edge, optionally with a few soft bokeh sparkles. No scenery, no circle, no frame.',
  'Absolutely no text, letters, logos or watermarks.',
  'Adult character aged 20 to 30, fully clothed with a modest neckline, stylish, tasteful and suitable for all ages; not sexualised.',
].join(' ')

// Ids and paths must match AVATAR_PRESETS in src/lib/profile/avatarPresets.ts and the API.
const AVATARS = [
  { id: 'men-warrior', path: 'avatars/men/warrior.png', background: 'deep charcoal grey',
    person: 'the bad boy: a man around 26 with a sharp undercut, a small silver earring and a cocky half-smirk, a black leather rider jacket over a plain black tee, one eyebrow slightly raised' },
  { id: 'men-samurai', path: 'avatars/men/samurai.png', background: 'muted deep teal',
    person: 'the ronin: a lean, intense man around 30 with long black hair tied back loosely, a faint scar through one eyebrow and a calm, piercing gaze, wearing a dark indigo kimono with a black haori' },
  { id: 'men-noble', path: 'avatars/men/noble.png', background: 'warm sand beige',
    person: 'the heartthrob: a strikingly handsome man around 27 with a strong jawline, swept-back glossy black hair and a confident, charming smile, a crisp white shirt with the top button open under a charcoal haori jacket' },
  { id: 'men-emperor', path: 'avatars/men/emperor.png', background: 'cool slate blue',
    person: 'the executive: a cool, composed Tokyo businessman around 30 with slicked-back hair, thin silver rectangular glasses, a calm cool gaze and a faint smile, a tailored navy three-piece suit, white shirt and a dark burgundy tie; clearly a different face from the reference' },
  { id: 'men-citizen', path: 'avatars/men/citizen.png', background: 'soft sky blue',
    person: 'the sweetheart: a cute, boyish man around 23 with fluffy messy hair, round tortoiseshell glasses and a shy, warm smile with slightly pink cheeks, an oversized cream cable-knit sweater' },
  { id: 'women-geisha-1', path: 'avatars/women/geisha_1.png', background: 'deep wine red',
    person: 'the elegant one: a beautiful, poised woman around 28 with an elegant traditional updo and gold kanzashi pins, refined red lips and a knowing smile, a luxurious black silk kimono with red and gold crane embroidery' },
  { id: 'women-geisha-2', path: 'avatars/women/geisha_2.png', background: 'soft lilac',
    person: 'the idol: a glamorous, radiant woman around 23 with long glossy hair in soft waves, sparkling eyes and a playful wink, a chic pastel stage outfit with a ribbon detail, J-pop star style' },
  { id: 'women-japanese', path: 'avatars/women/japanese.png', background: 'warm marigold',
    person: 'the festival girl: a lovely woman around 24 with her hair in a loose bun and a small flower clip, a bright joyful laugh, a navy summer yukata with white morning-glory pattern, holding an uchiwa fan at her shoulder' },
  { id: 'women-casual-1', path: 'avatars/women/casual_1.png', background: 'cool stone grey',
    person: 'the CEO: a confident, attractive businesswoman around 32 with a sleek black bob, subtle gold earrings and a self-assured smile, a tailored ivory blazer over a black top' },
  { id: 'women-casual-2', path: 'avatars/women/casual_2.png', background: 'dusty rose',
    person: 'the rebel: a cool, edgy woman around 25 with long black hair with red streaks, bold winged eyeliner and a sly confident smirk, an oversized black bomber jacket over a hoodie, Harajuku street style' },
]

function parseArgs(argv) {
  const i = argv.indexOf('--only')
  const only = i === -1 ? '' : (argv[i + 1] ?? '')
  return {
    only: only ? new Set(only.split(',').map((s) => s.trim()).filter(Boolean)) : null,
    previewOnly: argv.includes('--preview'),
  }
}

function promptFor(avatar, isFirst) {
  const match = isFirst
    ? ''
    : ' The attached image is the first avatar of this set: match its anime art style, lineart, shading, lighting, head size and framing exactly, but draw a completely different person with a different personality.'
  return `${STYLE}${match} The person: ${avatar.person}. Background colour: ${avatar.background}.`
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function generateImage(ai, model, prompt, reference) {
  // Reference first, so the model anchors on it before reading the instructions.
  const input = reference
    ? [{ type: 'image', mime_type: 'image/png', data: reference.toString('base64') }, { type: 'text', text: prompt }]
    : prompt
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model,
        input,
        response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '1:1', image_size: GENERATE_SIZE },
      })
      const data = interaction.output_image?.data
      if (data) return Buffer.from(data, 'base64')
      // A refusal or a text-only answer comes back without an image.
      throw new Error(`no image returned${interaction.output_text ? `: ${interaction.output_text.slice(0, 200)}` : ''}`)
    } catch (err) {
      const message = apiMessage(err)
      // A bad key, bad request or missing access won't fix itself on retry.
      if (attempt === ATTEMPTS || NON_RETRYABLE.has(err.statusCode)) throw new Error(message, { cause: err })
      console.warn(`  attempt ${attempt} failed (${message}); retrying`)
      await sleep(RETRY_DELAY_MS * attempt)
    }
  }
  throw new Error('unreachable')
}

// 402: the prepaid balance ran out; retrying can't help.
const NON_RETRYABLE = new Set([400, 401, 402, 403, 404])

// The SDK's own message hides Google's explanation; it is in the response body.
function apiMessage(err) {
  try {
    const parsed = JSON.parse(err.body)
    const message = (Array.isArray(parsed) ? parsed[0] : parsed)?.error?.message
    if (message) return `${err.statusCode}: ${message}`
  } catch {
    // Not a JSON API error; fall back to the plain message.
  }
  return err.message
}

// Square, 512px PNG like the files it replaces; a non-square result is centre-cropped.
async function toSourcePng(raw) {
  const { width = 0, height = 0 } = await sharp(raw).metadata()
  if (Math.min(width, height) < SOURCE_PX) throw new Error(`image too small (${width}x${height})`)
  return sharp(raw).resize(SOURCE_PX, SOURCE_PX, { fit: 'cover', position: 'centre' }).png({ compressionLevel: 9 }).toBuffer()
}

async function generateAll(options) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing environment variable: GEMINI_API_KEY')
  const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL
  const ai = new GoogleGenAI({ apiKey })
  console.log(`Generating with ${model}`)

  // The first avatar sets the look; it is then the reference for the other nine,
  // so all ten read as one set. With --only and without it, its existing file is used.
  const targets = AVATARS.filter((a) => !options.only || options.only.has(a.id))
  if (targets.length === 0) throw new Error(`--only matched no avatar ids; valid ids: ${AVATARS.map((a) => a.id).join(', ')}`)
  let setReference = targets[0] === AVATARS[0] ? null : await readPublicOrCdn(`/${AVATARS[0].path}`)

  for (const avatar of targets) {
    process.stdout.write(`  ${avatar.id} … `)
    const raw = await generateImage(ai, model, promptFor(avatar, setReference === null), setReference)
    const png = await toSourcePng(raw)
    const file = path.join(PUBLIC_DIR, avatar.path)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, png)
    setReference ??= png
    console.log('done')
  }
}

async function writePreview() {
  const tile = 256
  const tiles = await Promise.all(AVATARS.map(async (a) => sharp(await readPublicOrCdn(`/${a.path}`)).resize(tile, tile).toBuffer()))
  await mkdir(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, 'preview.png')
  await sharp({ create: { width: tile * 5, height: tile * 2, channels: 3, background: '#ffffff' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % 5) * tile, top: Math.floor(i / 5) * tile })))
    .png()
    .toFile(file)
  console.log(`Preview: ${path.relative(ROOT, file)} (men on top, women below)`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!options.previewOnly) await generateAll(options)
  await writePreview()
  console.log('Review the preview, then upload: node --env-file=.env.local scripts/upload-assets/upload-assets.mjs')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exitCode = 1
})
