#!/usr/bin/env node
/**
 * Generates the 10 built-in avatars (5 men, 5 women) with Gemini, then uploads
 * them to Cloudflare R2 and points the app at the new files. All prompts live
 * in this file; you never write one.
 *
 * Ids and file names stay the same as before (men-warrior → /avatars/men/warrior.png …),
 * so users who already chose an avatar keep it and the API needs no change.
 *
 * Setup (once):
 *   cd scripts/generate-avatars && npm install && cd ../..
 *
 * 1. Generate + upload (run from FluentFoxUi/):
 *   GEMINI_API_KEY=... R2_ACCOUNT_ID=... R2_ACCESS_KEY=... R2_SECRET_KEY=... R2_BUCKET_NAME=... \
 *   node scripts/generate-avatars/generate-avatars.mjs
 *
 *   - Writes the new PNGs to public/avatars/{men,women}/ and a preview sheet to
 *     scripts/generate-avatars/out/preview.png. Look at it before you deploy.
 *   - Uploads each avatar as WebP under a new hashed name (avatars/men/warrior.<hash>.webp)
 *     and updates src/lib/assetManifest.json. Commit that file and deploy the frontend.
 *   - Old files stay in R2 so the site that is live right now keeps working.
 *
 * 2. After the new frontend is live, delete the old avatar files from R2:
 *   R2_ACCOUNT_ID=... R2_ACCESS_KEY=... R2_SECRET_KEY=... R2_BUCKET_NAME=... \
 *   node scripts/generate-avatars/generate-avatars.mjs --delete-old
 *
 *   Deletes every object under avatars/men/ and avatars/women/ that the manifest
 *   no longer uses. User uploads (avatars/users/) are never touched.
 *
 * Options:
 *   --only men-warrior,women-casual-1   regenerate just these (the rest are used as-is)
 *   --no-upload                         generate locally only, to review first
 *   --skip-generate                     upload the PNGs already in public/avatars/
 *   --dry-run                           show what would be uploaded or deleted; change nothing remote
 *   GEMINI_IMAGE_MODEL=...              override the model (default gemini-3-pro-image)
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { GoogleGenAI } from '@google/genai'
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(SCRIPT_DIR, '../..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const MANIFEST_PATH = path.join(ROOT, 'src/lib/assetManifest.json')
const OUT_DIR = path.join(SCRIPT_DIR, 'out')

// Gemini 3 Pro Image ("Nano Banana Pro"): Google's highest-quality image model.
const DEFAULT_MODEL = 'gemini-3-pro-image'
const GENERATE_SIZE = '1K'
const ATTEMPTS = 3
const RETRY_DELAY_MS = 4000

// Same sizes as scripts/upload-assets: 512px source, 256px WebP served (2x the largest avatar on screen).
const SOURCE_PX = 512
const SERVED_PX = 256
const WEBP_QUALITY = 82
const HASH_LENGTH = 10
const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'
const PRESET_PREFIXES = ['avatars/men/', 'avatars/women/']
const REQUIRED_R2_ENV = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET_NAME']

const STYLE = [
  'A profile avatar for FoxSensei, a friendly app for learning Japanese.',
  'Style: modern flat vector illustration with clean, confident outlines, soft cel shading and a small, harmonious palette.',
  'Composition: one person, head and shoulders, centred, facing the viewer with a warm, friendly expression.',
  'Leave even space around the head so the whole face and hair fit inside a circular crop.',
  'Background: a single flat pastel colour, no scenery, no pattern.',
  'Absolutely no text, letters, logos, watermarks, borders or frames.',
  'Tasteful and respectful depiction of Japanese culture; adult character, fully clothed, suitable for all ages.',
].join(' ')

// Ids and paths must match AVATAR_PRESETS in src/lib/profile/avatarPresets.ts and the API.
const AVATARS = [
  { id: 'men-warrior', path: 'avatars/men/warrior.png', background: 'soft peach',
    person: 'a cheerful young martial artist with short black hair, a red hachimaki headband and a white keikogi' },
  { id: 'men-samurai', path: 'avatars/men/samurai.png', background: 'pale sage green',
    person: 'a calm samurai in his thirties with a neat topknot (chonmage), dark lacquered shoulder armour over an indigo kimono' },
  { id: 'men-noble', path: 'avatars/men/noble.png', background: 'light lavender',
    person: 'a Heian-period court noble with a tall black eboshi hat and layered silk robes in muted green and gold' },
  { id: 'men-emperor', path: 'avatars/men/emperor.png', background: 'warm cream',
    person: 'a dignified older man in formal Heian-era imperial court dress with a black kanmuri crown and deep orange robes' },
  { id: 'men-citizen', path: 'avatars/men/citizen.png', background: 'light sky blue',
    person: 'a friendly modern young man from Tokyo with tousled dark hair, round glasses and a casual navy hoodie' },
  { id: 'women-geisha-1', path: 'avatars/women/geisha_1.png', background: 'blush pink',
    person: 'a graceful geisha with a traditional black nihongami hairstyle, simple gold kanzashi hairpins, subtle classic makeup and a deep red kimono' },
  { id: 'women-geisha-2', path: 'avatars/women/geisha_2.png', background: 'pale mint',
    person: 'a young maiko with flower kanzashi hair ornaments, a soft smile and a pastel pink kimono with a floral pattern' },
  { id: 'women-japanese', path: 'avatars/women/japanese.png', background: 'light butter yellow',
    person: 'a smiling young woman in a blue summer yukata with a white flower pattern, hair in a loose bun, holding a small uchiwa fan near her shoulder' },
  { id: 'women-casual-1', path: 'avatars/women/casual_1.png', background: 'soft coral',
    person: 'a cheerful modern university student with a short black bob haircut and a cream knit cardigan' },
  { id: 'women-casual-2', path: 'avatars/women/casual_2.png', background: 'light periwinkle',
    person: 'a relaxed modern young woman with long dark brown hair, headphones around her neck and a light denim jacket' },
]

function parseArgs(argv) {
  const value = (flag) => {
    const i = argv.indexOf(flag)
    return i === -1 ? null : (argv[i + 1] ?? '')
  }
  const only = value('--only')
  return {
    only: only ? new Set(only.split(',').map((s) => s.trim()).filter(Boolean)) : null,
    upload: !argv.includes('--no-upload'),
    generate: !argv.includes('--skip-generate'),
    deleteOld: argv.includes('--delete-old'),
    dryRun: argv.includes('--dry-run'),
  }
}

function promptFor(avatar, hasReference) {
  const match = hasReference
    ? ' Match the art style, line weight, shading and proportions of the reference image exactly, but draw a different person.'
    : ''
  return `${STYLE}${match} The person: ${avatar.person}. Background colour: ${avatar.background}.`
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function generateImage(ai, model, prompt, reference) {
  const input = reference
    ? [{ type: 'text', text: prompt }, { type: 'image', mime_type: 'image/png', data: reference.toString('base64') }]
    : prompt
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model,
        input,
        response_format: { type: 'image', mime_type: 'image/png', aspect_ratio: '1:1', image_size: GENERATE_SIZE },
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

const NON_RETRYABLE = new Set([400, 401, 403, 404])

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

  // The first avatar generated (or the existing men-warrior file when it isn't
  // being regenerated) is the style reference, so all ten look like one set.
  const targets = AVATARS.filter((a) => !options.only || options.only.has(a.id))
  if (targets.length === 0) throw new Error(`--only matched no avatar ids; valid ids: ${AVATARS.map((a) => a.id).join(', ')}`)
  let reference = options.only && !options.only.has(AVATARS[0].id) ? await readFile(path.join(PUBLIC_DIR, AVATARS[0].path)) : null

  for (const avatar of targets) {
    process.stdout.write(`  ${avatar.id} … `)
    const raw = await generateImage(ai, model, promptFor(avatar, reference !== null), reference)
    const png = await toSourcePng(raw)
    await writeFile(path.join(PUBLIC_DIR, avatar.path), png)
    reference ??= png
    console.log('done')
  }
}

async function writePreview() {
  const tile = 256
  const tiles = await Promise.all(AVATARS.map((a) => sharp(path.join(PUBLIC_DIR, a.path)).resize(tile, tile).toBuffer()))
  await mkdir(OUT_DIR, { recursive: true })
  const file = path.join(OUT_DIR, 'preview.png')
  await sharp({ create: { width: tile * 5, height: tile * 2, channels: 3, background: '#ffffff' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % 5) * tile, top: Math.floor(i / 5) * tile })))
    .png()
    .toFile(file)
  console.log(`Preview: ${path.relative(ROOT, file)} (men on top, women below)`)
}

function createClient() {
  const missing = REQUIRED_R2_ENV.filter((name) => !process.env[name])
  if (missing.length > 0) throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY, secretAccessKey: process.env.R2_SECRET_KEY },
  })
}

async function readManifest() {
  return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
}

async function uploadAll(options) {
  const client = options.dryRun ? null : createClient()
  const bucket = process.env.R2_BUCKET_NAME
  const manifest = await readManifest()

  for (const avatar of AVATARS) {
    const source = await readFile(path.join(PUBLIC_DIR, avatar.path))
    const body = await sharp(source).resize(SERVED_PX, SERVED_PX).webp({ quality: WEBP_QUALITY, effort: 6 }).toBuffer()
    const hash = createHash('sha256').update(body).digest('hex').slice(0, HASH_LENGTH)
    const key = `${avatar.path.slice(0, -path.extname(avatar.path).length)}.${hash}.webp`
    const publicPath = `/${avatar.path}`
    if (manifest[publicPath] === key) {
      console.log(`  ${avatar.id}: unchanged`)
      continue
    }
    if (!options.dryRun) {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'image/webp', CacheControl: IMMUTABLE_CACHE }))
    }
    console.log(`  ${avatar.id}: ${options.dryRun ? 'would upload' : 'uploaded'} ${key} (${(body.length / 1024).toFixed(1)} KB)`)
    manifest[publicPath] = key
  }

  if (options.dryRun) return
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`)
  console.log(`Updated ${path.relative(ROOT, MANIFEST_PATH)}. Commit it and deploy the frontend, then run with --delete-old.`)
}

async function listKeys(client, bucket, prefix) {
  const keys = []
  let token
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }))
    keys.push(...(page.Contents ?? []).map((o) => o.Key))
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return keys
}

async function deleteOld(options) {
  const client = createClient()
  const bucket = process.env.R2_BUCKET_NAME
  const inUse = new Set(Object.values(await readManifest()))
  const stale = []
  for (const prefix of PRESET_PREFIXES) {
    stale.push(...(await listKeys(client, bucket, prefix)).filter((key) => !inUse.has(key)))
  }
  if (stale.length === 0) {
    console.log('No old avatar files in R2.')
    return
  }
  for (const key of stale) console.log(`  ${options.dryRun ? 'would delete' : 'delete'} ${key}`)
  if (options.dryRun) return
  // DeleteObjects takes up to 1000 keys; ten avatars never come close.
  const result = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: stale.map((Key) => ({ Key })) } }))
  if (result.Errors?.length) throw new Error(`delete failed: ${result.Errors.map((e) => `${e.Key} ${e.Message}`).join('; ')}`)
  console.log(`Deleted ${stale.length} old avatar file(s).`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.deleteOld) return deleteOld(options)
  if (options.generate) await generateAll(options)
  await writePreview()
  if (options.upload) await uploadAll(options)
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exitCode = 1
})
