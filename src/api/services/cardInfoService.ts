/**
 * What the lesson cards and the leech hint show about one item: its reading
 * or meaning, a memory hook and its look-alikes. Built from the content
 * services (`/content/*` with the bundled fallback), so it works for any card
 * the learn API names by character.
 */
import type { SrsItemType } from '@/types/learn'
import type { KanaChar } from '@/types'
import { kanjiService } from '@/api/services/kanjiService'
import { kunLabel } from '@/lib/content/kanji/kanjiText'
import { KANA_SCRIPTS } from '@/lib/content/kana/scripts'
import { kanaReadingLabel } from '@/lib/content/kana/kanaMarks'
import type { RegisteredKanaScriptId } from '@/lib/content/kana/scriptIds'

export interface CardLookAlike {
  char: string
  /** Its reading (kana) or meaning (kanji). */
  label?: string
  /** How to tell them apart. */
  note?: string
}

export interface CardInfo {
  char: string
  itemType: SrsItemType
  /** Romaji for kana, the main meaning for kanji. */
  title: string
  /** Kanji only: other meanings and the readings. */
  details: string[]
  mnemonic?: string
  lookAlikes: CardLookAlike[]
}

const KATAKANA = /[゠-ヿ]/

function scriptOf(char: string): RegisteredKanaScriptId {
  return KATAKANA.test(char) ? 'katakana' : 'hiragana'
}

async function kanaInfo(char: string): Promise<CardInfo | null> {
  const script = KANA_SCRIPTS[scriptOf(char)]
  const all = (await script.loadSections()).flatMap((s) => s.chars).filter((k) => !k.isEmpty)
  const byChar = new Map<string, KanaChar>(all.map((k) => [k.character, k]))
  const kana = byChar.get(char)
  if (!kana) return null
  const lookAlikes = (script.lookAlikes[char] ?? []).map((other) => {
    const k = byChar.get(other)
    return { char: other, label: k ? kanaReadingLabel(k) : undefined }
  })
  return {
    char,
    itemType: 'kana',
    title: kanaReadingLabel(kana),
    details: [],
    mnemonic: script.memoryHint(kana.character, kana.romaji),
    lookAlikes,
  }
}

async function kanjiInfo(char: string): Promise<CardInfo | null> {
  const entry = await kanjiService.getKanji(char)
  if (!entry) return null
  const readings = [...entry.on, ...entry.kun.map(kunLabel)]
  const lookAlikes = await Promise.all(
    (entry.lookAlikes ?? []).map(async (l) => {
      const other = await kanjiService.getKanji(l.char).catch(() => null)
      return { char: l.char, label: other?.meanings[0], note: l.note }
    }),
  )
  return {
    char,
    itemType: 'kanji',
    title: entry.meanings[0] ?? '',
    details: [entry.meanings.slice(1).join(', '), readings.join('、')].filter(Boolean),
    mnemonic: entry.mnemonic?.text,
    lookAlikes,
  }
}

export const cardInfoService = {
  /** Null when the content has no such item (e.g. a level not bundled yet). */
  get(itemType: SrsItemType, char: string): Promise<CardInfo | null> {
    return itemType === 'kana' ? kanaInfo(char) : kanjiInfo(char)
  },
}
