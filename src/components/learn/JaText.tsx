import { Fragment } from 'react'
import { cn } from '@/lib/cn'

// Hiragana, katakana, the dakuten marks and Japanese punctuation.
const JA_RUN = /([　-〿぀-ヿ]+)/

interface JaTextProps {
  text: string
  /** Extra classes for the Japanese runs only. */
  jaClassName?: string
}

/**
 * JaText — renders mixed English/Japanese copy (e.g. "か row") with every
 * Japanese run wrapped in `lang="ja"` + the rounded JP face, so screen readers
 * switch voice and the kana use the right glyphs.
 */
export function JaText({ text, jaClassName }: JaTextProps) {
  const parts = text.split(JA_RUN)
  return (
    <>
      {parts.map((part, i) =>
        // split() with a capture group puts the matches at odd indexes.
        i % 2 === 1 ? (
          <span key={i} lang="ja" className={cn('font-jp', jaClassName)}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}
