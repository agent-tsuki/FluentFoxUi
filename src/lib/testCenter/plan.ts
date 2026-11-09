import { shuffle } from '@/lib/pdf/shared'

export interface Planned<T, F> {
  target: T
  format: F
}

/**
 * Which item each question asks about, in which format. Formats take turns
 * (so a mixed test stays mixed); each format works through its own shuffled
 * copy of the items, preferring items no question has used yet and never the
 * item just asked. At most items × formats questions.
 */
export function planQuestions<T, F>(
  targets: readonly T[],
  formats: readonly F[],
  count: number,
  keyOf: (target: T) => string,
  random: () => number = Math.random,
): Planned<T, F>[] {
  if (targets.length === 0 || formats.length === 0) return []
  const queues = formats.map(() => shuffle(targets, random))
  const used = new Set<string>()
  const out: Planned<T, F>[] = []
  const total = Math.min(count, targets.length * formats.length)
  let turn = 0
  let idle = 0
  while (out.length < total && idle < formats.length) {
    const f = turn % formats.length
    turn++
    const queue = queues[f]
    if (queue.length === 0) {
      idle++
      continue
    }
    idle = 0
    const previous = out.length ? keyOf(out[out.length - 1].target) : undefined
    const fresh = queue.findIndex((t) => !used.has(keyOf(t)) && keyOf(t) !== previous)
    const notPrevious = queue.findIndex((t) => keyOf(t) !== previous)
    const at = fresh !== -1 ? fresh : notPrevious !== -1 ? notPrevious : 0
    const [target] = queue.splice(at, 1)
    used.add(keyOf(target))
    out.push({ target, format: formats[f] })
  }
  return out
}

/** Up to `n` distinct labels from `pool`, skipping any `same` as the answer. */
export function pickDistractors(
  pool: readonly string[],
  same: (label: string) => boolean,
  n: number,
  random: () => number = Math.random,
  prefer: readonly string[] = [],
): string[] {
  const picked: string[] = []
  for (const label of [...shuffle(prefer, random), ...shuffle(pool, random)]) {
    if (picked.length >= n) break
    if (!same(label) && !picked.includes(label)) picked.push(label)
  }
  return picked
}
