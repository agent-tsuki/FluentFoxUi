/**
 * How spoken text maps to audio clips: split into sentences (one clip each)
 * and name each clip by the SHA-256 of its sentence. This must match the API
 * exactly (FluentFox internal/audio/text.go), so a clip can be fetched straight
 * from the CDN without asking the API. sentences.vectors.json is a copy of the
 * API's internal/audio/testdata/sentences.json; both test suites run it.
 */

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u
/** Closing brackets and final quotes (」』）】 ” ’): they stay with the sentence they close. */
const CLOSING = /[\p{Pe}\p{Pf}]/u
/** JavaScript's \s plus U+0085, which Go's unicode.IsSpace also counts. */
const SPACES = /[\s\u0085]+/

const isSentenceEnd = (ch: string) => ch === '。' || ch === '!' || ch === '?'

/**
 * Steps: NFKC (half-width kana and full-width ASCII fold, so ！ becomes !),
 * drop U+FEFF, end a sentence after 。 ! ? (keeping closing brackets and
 * further marks that follow) and at line breaks, collapse whitespace to one
 * space and trim. A piece with no letter or digit joins the sentence before it.
 */
export function sentences(text: string): string[] {
  const folded = text.normalize('NFKC').replace(/\uFEFF/g, '')
  const out: string[] = []
  let current = ''
  const flush = () => {
    const piece = current.split(SPACES).filter(Boolean).join(' ')
    current = ''
    if (!piece) return
    if (!LETTER_OR_DIGIT.test(piece) && out.length > 0) out[out.length - 1] += piece
    else out.push(piece)
  }
  let ending = false
  for (const ch of folded) {
    if (ch === '\n' || ch === '\r') {
      ending = false
      flush()
      continue
    }
    if (ending && !isSentenceEnd(ch) && !CLOSING.test(ch)) {
      ending = false
      flush()
    }
    current += ch
    if (isSentenceEnd(ch)) ending = true
  }
  flush()
  return out
}

/** Hex SHA-256 of a sentence: its clip's file name. */
export async function clipHash(sentence: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sentence))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
