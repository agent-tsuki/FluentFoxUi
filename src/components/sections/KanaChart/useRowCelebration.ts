import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KanaChar } from '@/types'
import type { KanaMastery } from '@/types/kanaProgress'

const ROW_LENGTH = 5

interface KanaRow {
  /** First kana's id, e.g. 'ka' — what we remember as celebrated. */
  key: string
  /** First kana, e.g. 'か' — what we show ("か row learned!"). */
  head: string
  ids: string[]
}

function readCelebrated(storageKey: string): Set<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeCelebrated(storageKey: string, keys: Set<string>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...keys]))
  } catch {
    /* storage blocked: the row may be celebrated again next visit; harmless */
  }
}

/** Splits the basic chart into its 5-column rows, dropping empty slots. */
export function toRows(chars: KanaChar[]): KanaRow[] {
  const rows: KanaRow[] = []
  for (let i = 0; i < chars.length; i += ROW_LENGTH) {
    const playable = chars.slice(i, i + ROW_LENGTH).filter((c) => !c.isEmpty)
    if (playable.length > 0) {
      rows.push({ key: playable[0].id, head: playable[0].character, ids: playable.map((c) => c.id) })
    }
  }
  return rows
}

function messageFor(rows: KanaRow[]): string {
  const heads = rows.map((r) => r.head)
  if (heads.length === 1) return rows[0].ids.length === 1 ? `${heads[0]} learned!` : `${heads[0]} row learned!`
  return `${heads.slice(0, -1).join(', ')} and ${heads[heads.length - 1]} rows learned!`
}

// Familiar or better: remembered for a day or more.
const isLearned = (m: KanaMastery) => m === 'familiar' || m === 'strong' || m === 'mastered'

/**
 * Watches the basic chart and returns a message the first time a whole row
 * reaches 'familiar'. Rows are remembered in localStorage so each one is only
 * ever celebrated once (progress made on the practice pages is picked up when
 * the learner comes back to the chart). `storageKey` is per script.
 */
export function useRowCelebration(basicChars: KanaChar[], mastery: (id: string) => KanaMastery, storageKey: string) {
  const rows = useMemo(() => toRows(basicChars), [basicChars])
  const [message, setMessage] = useState<string | null>(null)

  // A string of learned row keys: the effect only re-runs when it changes.
  const learnedKey = rows
    .filter((row) => row.ids.every((id) => isLearned(mastery(id))))
    .map((row) => row.key)
    .join(',')

  useEffect(() => {
    if (!learnedKey) return
    const celebrated = readCelebrated(storageKey)
    const fresh = rows.filter((row) => learnedKey.split(',').includes(row.key) && !celebrated.has(row.key))
    if (fresh.length === 0) return
    fresh.forEach((row) => celebrated.add(row.key))
    writeCelebrated(storageKey, celebrated)
    setMessage(messageFor(fresh))
  }, [learnedKey, rows, storageKey])

  const dismiss = useCallback(() => setMessage(null), [])
  return { message, dismiss }
}
