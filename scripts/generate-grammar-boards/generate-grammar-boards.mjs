#!/usr/bin/env node
/**
 * Generates the illustrated N5 grammar boards (one per chapter) with Gemini,
 * and makes their background transparent. All prompts live in this file.
 * Chapter 1 (public/images/grammar/n5/boards/n5_ch_one.webp) is the style
 * reference, so every board matches its wood, tiles and Fox Sensei mascot.
 * Uploading is done by scripts/upload-assets, like every other image.
 *
 * Setup (once):
 *   cd scripts/generate-grammar-boards && npm install && cd ../..
 *
 * Keys go in FluentFoxUi/.env.local (git-ignored), never in code or chat:
 *   GEMINI_API_KEY=...
 *   R2_ACCOUNT_ID=...  R2_ACCESS_KEY=...  R2_SECRET_KEY=...  R2_BUCKET_NAME=...
 *
 * 1. Generate one chapter and look at it (run from FluentFoxUi/):
 *   node --env-file=.env.local scripts/generate-grammar-boards/generate-grammar-boards.mjs --only 2
 *   → public/images/grammar/n5/boards/n5_ch_two.webp   (transparent, 1536×920)
 *   → scripts/generate-grammar-boards/out/n5_ch_two-preview.png  (on navy and on white)
 *
 * 2. Upload what you approved (hashed name + src/lib/assetManifest.json; commit that file):
 *   node --env-file=.env.local scripts/upload-assets/upload-assets.mjs
 *   → images/grammar/n5/boards/n5_ch_two.<hash>.webp, cached for a year. The page
 *     reads it through asset('/images/grammar/n5/boards/n5_ch_two.webp').
 *
 * Options:
 *   --only 2,3,10      just these chapters (default: every chapter below)
 *   GEMINI_IMAGE_MODEL=...  override the model (default gemini-3-pro-image)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { GoogleGenAI } from '@google/genai'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(SCRIPT_DIR, '../..')
const BOARD_DIR = path.join(ROOT, 'public/images/grammar/n5/boards')
const OUT_DIR = path.join(SCRIPT_DIR, 'out')

const DEFAULT_MODEL = 'gemini-3-pro-image'
const GENERATE_SIZE = '2K'
const ATTEMPTS = 3
const RETRY_DELAY_MS = 4000
const NON_RETRYABLE = new Set([400, 401, 402, 403, 404])

// Chapter 1 anchors the style of the whole set.
const REFERENCE_PATH = '/images/grammar/n5/boards/n5_ch_one.webp'

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


// Every board is placed on the same canvas so the page layout never shifts between chapters.
const CANVAS_W = 1536
const CANVAS_H = 920
const CANVAS_PAD = 16
const WEBP_QUALITY = 86

// Same tones the site uses for grammar diagrams (src/index.css .diagram-tone-*).
const TONES = {
  moss: 'moss green (#6E9C70)',
  coral: 'coral (#E27C5A)',
  blue: 'soft blue (#6CA3C8)',
  plum: 'plum (#9B6A9E)',
  amber: 'warm amber (#E3A54C)',
}

// Gemini cannot paint transparency, so it paints this flat key colour and we remove it.
const KEY_COLOUR = 'pure chroma-key green (#00FF00)'

const STYLE = `
Create one illustration, landscape 3:2.

BACKGROUND: a perfectly flat, uniform ${KEY_COLOUR} filling everything outside the board and mascot.
No gradient, no floor, no shadow on the background, no vignette, no other objects. Do not use that green anywhere on the board, tiles or fox.

COMPOSITION (copy the reference image): the board is a WIDE, SHORT strip — about 92% of the image width but only about 45% of the image height —
sitting in the LOWER half of the image. The upper half is empty background except for the fox peeking over the board.
Everything (board, cords, fox ears, tail, petals) is fully inside the image with a clear margin of background on every side. Nothing touches or crosses the image edge.

THE BOARD (identical in every image of this series): light hinoki cypress wood in warm honey-beige (#E8D2B0) with soft visible grain and rounded corners,
a thin dark indigo lacquer frame (#1E2742) with small brass corner caps.
Two short red-cord loops knotted through small holes at the board's two top corners, like an ema prayer board; the cords are short loops that stay close to the board and never extend upward.
A small hand-painted label at the top-left inside the board in dark indigo ink, English, all caps, clean sans-serif, no underline.

TILES: rounded-square matte ceramic tiles with a slight bevel, filling most of the board's height.
INSIDE each tile: the Japanese in big, bold, rounded CREAM-WHITE (#FFF6E8) letters, and directly beneath it, still INSIDE the same tile, the small English all-caps label in cream-white.
Never put text outside a tile except the board label. Never use dark text on a tile.
A tile may be wider than square when its Japanese is long, so the text never shrinks or wraps.

MASCOT "Fox Sensei" (identical to the fox in the reference image): a chibi fox peeking OVER the top edge of the board from behind it —
head, shoulders and both front paws above the board's top edge, paws resting on the edge, fluffy tail visible behind, about 40% of the image height.
Bright orange-red fur, cream-white muzzle, chest and tail tip, dark brown ear tips and paws, big warm amber eyes, open happy smile,
a small indigo scarf with a tiny pink sakura-petal pattern, holding a thin bamboo pointer that reaches down to touch one tile. Never covers a tile.

DECORATION: three or four pink sakura petals resting on the top edge of the board. Nothing else.

STYLE: hand-painted anime illustration, soft cel shading, clean outlines, warm light from the upper left with a subtle golden rim light,
cozy, premium, calm and uncluttered. Even, slightly flat lighting.

TEXT RULES: write ONLY the words listed below, spelled exactly, stroke-accurate Japanese, perfectly legible. Each tile's Japanese appears exactly once. No other text, no watermark, no signature.

HARD RULES: exactly ONE fox in the image. The board label is painted ON the wood inside the frame, never floating outside the board.
Every tile sits fully inside the board frame. The bamboo pointer never crosses or covers any text — it touches only the edge of its target tile.
`.trim()

const REFERENCE_NOTE =
  'The attached image is the first board of this series. Match it exactly: same wide short board proportions, wood, frame, red-cord loops, tile style with cream text inside the tiles, fonts, colours, lighting, and the very same Fox Sensei character at the same size peeking over the top edge. Only the board label, the tiles and the small layout details below change.'

/**
 * One entry per chapter that has a diagram in src/components/grammar/ChapterVisual.tsx.
 * `tiles` lists exactly what is written; `layout` says how they sit on the board.
 */
const CHAPTERS = [
  {
    id: 2, label: 'DISTANCE MAP', fox: 'left', points: 'これ',
    tiles: [['これ', 'NEAR ME', 'moss'], ['それ', 'NEAR YOU', 'blue'], ['あれ', 'FAR FROM BOTH', 'coral']],
    layout: 'Three tiles in one row with wide gaps. Under them a thin hand-painted dotted line runs left to right with a small round marker under each tile; the dots spread farther apart toward the right to show growing distance.',
  },
  {
    id: 3, label: 'LOCATION MAP', fox: 'left', points: 'ここ',
    tiles: [['ここ', 'HERE · NEAR ME', 'moss'], ['そこ', 'THERE · NEAR YOU', 'blue'], ['あそこ', 'OVER THERE', 'coral']],
    layout: 'Three tiles in one row with wide gaps. Above each tile a tiny painted map pin in the tile colour. Under them a thin dotted line runs left to right, the dots spreading farther apart toward the right to show growing distance.',
  },
  {
    id: 4, label: 'TIME LINE', fox: 'right', points: '7時に',
    tiles: [['7時に', 'AT SEVEN', 'amber'], ['おきます', 'WAKE UP', 'moss'], ['8時に', 'AT EIGHT', 'amber'], ['行きます', 'GO', 'blue']],
    layout: 'Four tiles in one row with a small coral arrow (→) between each. Above the two amber time tiles, a tiny painted round clock face (no numbers).',
  },
  {
    id: 5, label: 'TRAVEL ROUTE', fox: 'right', points: '電車で',
    tiles: [['家から', 'FROM HOME', 'moss'], ['電車で', 'BY TRAIN', 'blue'], ['学校へ', 'TO SCHOOL', 'coral']],
    layout: 'Three tiles in one row joined by a hand-painted dashed route line with arrowheads (→). A tiny painted house icon above the first tile, a tiny train above the second, a tiny school building above the third.',
  },
  {
    id: 6, label: 'OBJECT LINK', fox: 'right', points: 'りんごを',
    tiles: [['わたしは', 'TOPIC', 'moss'], ['りんごを', 'OBJECT', 'coral'], ['食べます', 'ACTION', 'blue']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. A tiny painted red apple sits on top of the middle tile.',
  },
  {
    id: 7, label: 'GIVING DIRECTION', fox: 'left', points: 'プレゼント',
    tiles: [['わたし', 'GIVER', 'moss'], ['プレゼント', 'GIFT', 'amber'], ['友だち', 'RECEIVER', 'blue']],
    layout: 'Three tiles in one row with a bold coral arrow (→) between each, showing the gift moving from left to right. A tiny wrapped gift box with a ribbon above the middle tile.',
  },
  {
    id: 8, label: 'ADJECTIVE FAMILIES', fox: 'right', points: '静か（な）',
    tiles: [['高い', 'I-ADJECTIVE', 'coral'], ['静か（な）', 'NA-ADJECTIVE', 'plum']],
    layout: 'Two large tiles side by side with generous space between them and a small painted indigo divider line between. The final い of 高い and the （な） are slightly brighter to highlight the ending.',
  },
  {
    id: 9, label: 'REASON CHAIN', fox: 'right', points: 'から',
    tiles: [['日本語が', 'JAPANESE', 'blue'], ['好きです', 'I LIKE IT', 'moss'], ['から', 'BECAUSE', 'coral']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. A tiny painted heart above the middle tile.',
  },
  {
    id: 10, label: 'ROOM MAP', fox: 'right', points: 'うえ',
    tiles: [['つくえ', 'THE REFERENCE', 'moss'], ['うえ', 'ON TOP', 'amber'], ['した', 'UNDER', 'blue'], ['となり', 'NEXT TO', 'coral']],
    layout: 'Exactly four tiles, each word used once, arranged as a plus-shaped spatial diagram that fits inside the board: the moss つくえ tile in the middle with a tiny painted wooden desk drawn on it; the amber うえ tile directly ABOVE the つくえ tile; the blue した tile directly BELOW the つくえ tile; the coral となり tile directly to the RIGHT of the つくえ tile. Nothing to the left of つくえ. Make the tiles smaller than usual so the whole plus shape fits inside the board with margin. Thin dotted lines link each outer tile to the centre tile.',
  },
  {
    id: 11, label: 'COUNTER GUIDE', fox: 'left', points: '三本',
    tiles: [['一つ', 'GENERAL THINGS', 'moss'], ['二人', 'PEOPLE', 'blue'], ['三本', 'LONG THINGS', 'coral']],
    layout: 'Three tiles in one row with even gaps. Above each tile a tiny painted icon: one red apple above 一つ, two small simple people above 二人, three pencils above 三本.',
  },
  {
    id: 12, label: 'COMPARISON SCALE', fox: 'right', points: 'ぶどう',
    tiles: [['りんご', 'A', 'coral'], ['ぶどう', 'B', 'plum']],
    layout: 'A small painted wooden balance scale in the centre of the board, tipped down on the left. The coral りんご tile hangs on the lower left pan with a tiny red apple; the plum ぶどう tile on the higher right pan with a tiny bunch of grapes.',
  },
  {
    id: 13, label: 'PURPOSE ROUTE', fox: 'right', points: 'くつを買いに',
    tiles: [['デパートへ', 'DESTINATION', 'blue'], ['くつを買いに', 'PURPOSE', 'amber'], ['行きます', 'MOVEMENT', 'moss']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. A tiny department store above the first tile, a tiny pair of shoes above the middle tile.',
  },
  {
    id: 14, label: 'VERB TRANSFORMATION', fox: 'right', points: '読んで',
    tiles: [['読みます', 'POLITE VERB', 'blue'], ['読んで', 'TE-FORM', 'coral'], ['ください', 'PLEASE', 'moss']],
    layout: 'Three tiles in one row. Between the first and second tile a curved coral "transform" arrow with a tiny sparkle; between the second and third a small coral arrow (→). A tiny open book above the first tile.',
  },
  {
    id: 15, label: 'RULE SIGNAL', fox: 'left', points: '見ても いい',
    tiles: [['見ても いい', 'PERMISSION', 'moss'], ['見ては いけない', 'NOT ALLOWED', 'coral']],
    layout: 'Two wide tiles side by side with a small painted indigo divider between them. A round green check-mark badge (✓) on the top-right corner of the moss tile, a round red cross badge (✕) on the top-right corner of the coral tile.',
  },
  {
    id: 16, label: 'VERB TRANSFORMATION', fox: 'right', points: '食べない',
    tiles: [['食べる', 'DICTIONARY FORM', 'blue'], ['食べない', 'NAI-FORM', 'coral'], ['ないでください', 'PLEASE DO NOT', 'moss']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. The last tile is wider to fit its text. A tiny bowl of rice with chopsticks above the first tile.',
  },
  {
    id: 17, label: 'ABILITY SHIFT', fox: 'left', points: '読める',
    tiles: [['読む', 'READ', 'blue'], ['読める', 'CAN READ', 'moss'], ['できます', 'BE ABLE TO', 'coral']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. A tiny open book above the first tile and a tiny gold star above the second.',
  },
  {
    id: 18, label: 'EXPERIENCE LINE', fox: 'right', points: 'ことが',
    tiles: [['日本へ 行った', 'PAST EVENT', 'blue'], ['ことが', 'EXPERIENCE MARKER', 'amber'], ['あります', 'HAVE EXPERIENCED', 'moss']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. The first tile is wider. A tiny red torii gate above the first tile.',
  },
  {
    id: 20, label: 'NOUN LENS', fox: 'right', points: '本',
    tiles: [['昨日 買った', 'DESCRIPTION', 'blue'], ['本', 'NOUN', 'amber'], ['を 読みます', 'MAIN ACTION', 'moss']],
    layout: 'Three tiles in one row. A small coral bracket arrow curves from the blue tile into the amber 本 tile to show the description attaches to the noun, then a small coral arrow (→) to the last tile. A tiny closed book above the 本 tile.',
  },
  {
    id: 21, label: 'NATURAL RESULT', fox: 'left', points: 'と',
    tiles: [['ボタンを 押す', 'TRIGGER', 'coral'], ['と', 'THEN', 'amber'], ['ドアが 開く', 'NATURAL RESULT', 'moss']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each; the middle と tile is smaller. A tiny round push button above the first tile and a tiny half-open sliding door above the last.',
  },
  {
    id: 22, label: 'CONDITIONAL PATH', fox: 'right', points: '雨が 降ったら',
    tiles: [['雨が 降ったら', 'IF IT RAINS', 'blue'], ['かさを', 'UMBRELLA', 'amber'], ['持ちます', 'TAKE IT', 'moss']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. A tiny rain cloud with drops above the first tile and a tiny closed umbrella above the second.',
  },
  {
    id: 23, label: 'DIRECTION LENS', fox: 'right', points: 'わたし → 友だち',
    tiles: [['わたし → 友だち', 'I GIVE · あげます', 'moss'], ['友だち → わたし', 'I RECEIVE · もらいます', 'blue']],
    layout: 'Two wide tiles side by side. Each tile shows its Japanese with the arrow inside it, and its small label underneath includes the Japanese verb exactly as written. A tiny wrapped gift between the two tiles.',
  },
  {
    id: 24, label: 'POTENTIAL FORM', fox: 'left', points: '読める',
    tiles: [['読む', 'ACTION', 'blue'], ['読める', 'POTENTIAL', 'moss'], ['しか ない', 'ONLY / LIMITATION', 'coral']],
    layout: 'Three tiles in one row with a small coral arrow (→) between each. A tiny open book above the first tile.',
  },
  {
    id: 25, label: 'TIMING LENS', fox: 'right', points: '食べた とき',
    tiles: [['食べる とき', 'BEFORE EATING', 'blue'], ['食べた とき', 'AFTER EATING', 'coral']],
    layout: 'Two wide tiles side by side. Above the left tile a tiny full bowl of rice; above the right tile a tiny empty bowl with chopsticks resting on it. A small painted clock-hand arrow curving from left to right between them.',
  },
]

function parseArgs(argv) {
  const i = argv.indexOf('--only')
  const only = i === -1 ? null : new Set((argv[i + 1] ?? '').split(',').map((s) => Number(s.trim())).filter(Boolean))
  return { only }
}

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty_one', 'twenty_two', 'twenty_three', 'twenty_four', 'twenty_five',
]

/** n5_ch_two, n5_ch_twenty_one … — the same naming as the chapter 1 board already on the CDN. */
const baseName = (id) => `n5_ch_${NUMBER_WORDS[id]}`
const fileName = (id) => `${baseName(id)}.webp`

function promptFor(chapter) {
  const tiles = chapter.tiles
    .map(([ja, en, tone], n) => `${n + 1}. ${TONES[tone]} tile: Japanese "${ja}", English label "${en}".`)
    .join('\n')
  const words = chapter.tiles.map(([ja]) => ja).join(' / ')
  const side = chapter.fox === 'left' ? 'far LEFT' : 'far RIGHT'
  return `${STYLE}

${REFERENCE_NOTE}

BOARD LABEL: "${chapter.label}"

TILES (left to right):
${tiles}

LAYOUT: ${chapter.layout}

MASCOT POSITION: Fox Sensei peeks from the ${side} end of the board, pointing the bamboo pointer at the "${chapter.points}" tile.

The Japanese text must be EXACTLY: ${words}. Double-check every character.`
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function apiMessage(err) {
  try {
    const parsed = JSON.parse(err.body)
    const message = (Array.isArray(parsed) ? parsed[0] : parsed)?.error?.message
    if (message) return `${err.statusCode}: ${message}`
  } catch {
    // Not a JSON API error.
  }
  return err.message
}

async function generateImage(ai, model, prompt, reference) {
  // Reference first, so the model anchors on it before reading the instructions.
  const input = [
    { type: 'image', mime_type: 'image/png', data: reference.toString('base64') },
    { type: 'text', text: prompt },
  ]
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model,
        input,
        response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '3:2', image_size: GENERATE_SIZE },
      })
      const data = interaction.output_image?.data
      if (data) return Buffer.from(data, 'base64')
      throw new Error(`no image returned${interaction.output_text ? `: ${interaction.output_text.slice(0, 200)}` : ''}`)
    } catch (err) {
      const message = apiMessage(err)
      if (attempt === ATTEMPTS || NON_RETRYABLE.has(err.statusCode)) throw new Error(message, { cause: err })
      console.warn(`  attempt ${attempt} failed (${message}); retrying`)
      await sleep(RETRY_DELAY_MS * attempt)
    }
  }
  throw new Error('unreachable')
}

/**
 * Removes the chroma-green background. Pixels that are clearly key-green become
 * transparent; a soft band around them fades out and loses its green spill so the
 * outline stays clean on both the dark navy and the white page.
 * The moss tile (#6E9C70) is far below these thresholds, so it is never touched.
 */
async function removeKeyBackground(raw) {
  const { data, info } = await sharp(raw).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let p = 0; p < data.length; p += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2]
    const spill = g - Math.max(r, b)
    if (g > 150 && spill > 110) {
      data[p + 3] = 0
    } else if (g > 120 && spill > 55) {
      data[p + 3] = Math.round(255 * (1 - (spill - 55) / 55))
      data[p + 1] = Math.max(r, b)
    }
  }
  return sharp(data, { raw: info }).png().toBuffer()
}

/** Trims to the visible art and centres it on the fixed 1536×920 canvas. */
async function fitToCanvas(png) {
  const trimmed = await sharp(png).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 }).toBuffer()
  const inner = await sharp(trimmed)
    .resize(CANVAS_W - CANVAS_PAD * 2, CANVAS_H - CANVAS_PAD * 2, { fit: 'inside' })
    .toBuffer()
  return sharp({ create: { width: CANVAS_W, height: CANVAS_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toBuffer()
}

/** The board shown on the dark page colour and on white, side by side, for review. */
async function writePreview(id, png) {
  const half = await sharp(png).resize(768).toBuffer()
  const h = Math.round((CANVAS_H / CANVAS_W) * 768)
  const file = path.join(OUT_DIR, `${baseName(id)}-preview.png`)
  await sharp({ create: { width: 1536, height: h, channels: 3, background: '#0F1528' } })
    .composite([
      { input: { create: { width: 768, height: h, channels: 3, background: '#FFFFFF' } }, left: 768, top: 0 },
      { input: half, left: 0, top: 0 },
      { input: half, left: 768, top: 0 },
    ])
    .png()
    .toFile(file)
  return file
}

async function loadReference() {
  // White behind the transparent areas, so the model never mistakes them for the key colour.
  return sharp(await readPublicOrCdn(REFERENCE_PATH)).flatten({ background: '#FFFFFF' }).png().toBuffer()
}

async function generateAll(targets) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY. Put it in FluentFoxUi/.env.local and run with node --env-file=.env.local')
  const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL
  const ai = new GoogleGenAI({ apiKey })
  const reference = await loadReference()
  await mkdir(BOARD_DIR, { recursive: true })
  await mkdir(OUT_DIR, { recursive: true })
  console.log(`Generating ${targets.length} board(s) with ${model}`)

  for (const chapter of targets) {
    process.stdout.write(`  chapter ${chapter.id} … `)
    const raw = await generateImage(ai, model, promptFor(chapter), reference)
    await writeFile(path.join(OUT_DIR, `${baseName(chapter.id)}-raw.jpg`), raw)
    const png = await fitToCanvas(await removeKeyBackground(raw))
    await writeFile(path.join(BOARD_DIR, fileName(chapter.id)), await sharp(png).webp({ quality: WEBP_QUALITY, alphaQuality: 100, effort: 6 }).toBuffer())
    const preview = await writePreview(chapter.id, png)
    console.log(`done → ${path.relative(ROOT, preview)}`)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const targets = CHAPTERS.filter((c) => !options.only || options.only.has(c.id))
  if (targets.length === 0) throw new Error(`--only matched no chapter; valid: ${CHAPTERS.map((c) => c.id).join(', ')}`)
  await generateAll(targets)
  console.log('\nReview the previews, then upload: node --env-file=.env.local scripts/upload-assets/upload-assets.mjs')
}

main().catch((err) => {
  console.error(`\n${err.message}`)
  process.exitCode = 1
})
