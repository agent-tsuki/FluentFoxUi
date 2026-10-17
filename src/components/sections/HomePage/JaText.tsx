// Kana, CJK punctuation, kanji and full-width forms (incl. ～ and ・).
const JA_RUN = /([　-ヿ㐀-䶿一-鿿＀-￯]+)/

/**
 * Renders mixed English/Japanese copy, wrapping each Japanese run in a
 * `lang="ja"` + `font-jp` span so screen readers and the JP font pick it up.
 */
export function JaText({ text }: { text: string }) {
  const parts = text.split(JA_RUN)
  return (
    <>
      {parts.map((part, i) =>
        // split() with a capture group puts the matched runs at odd indices.
        i % 2 === 1 ? (
          <span key={i} lang="ja" className="font-jp">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}
