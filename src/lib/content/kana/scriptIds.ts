/**
 * The kana scripts the course engine knows about. Kept in its own tiny module
 * (no content imports) so the router can build the per-script route trees
 * without pulling any course data into the initial bundle.
 */
export type KanaScriptId = 'hiragana' | 'katakana'

/**
 * Scripts with a live course: routes under `/kana/<id>/…` and progress
 * storage. A script is added here only once its `KanaScriptConfig` exists in
 * `KANA_SCRIPTS` (scripts.ts enforces that at compile time).
 */
export const KANA_SCRIPT_IDS = ['hiragana', 'katakana'] as const satisfies readonly KanaScriptId[]

export type RegisteredKanaScriptId = (typeof KANA_SCRIPT_IDS)[number]

/** `/kana/hiragana`, `/kana/katakana`. */
export function kanaBasePath(id: KanaScriptId): string {
  return `/kana/${id}`
}
