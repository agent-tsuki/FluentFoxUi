import { memo, useState } from 'react'
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import { asset, hasAsset } from '@/lib/assets'

interface WordPictureProps {
  script: KanaScriptId
  romaji: string
  /** What the picture shows, read as its alt text. */
  meaning: string
  /** Emoji shown until the illustration is uploaded, or if it fails to load. */
  emoji: string
}

const SIZE = 160

/** The generated illustration for a Word builder word (scripts/kana-words), with its emoji as the fallback. */
export const WordPicture = memo(function WordPicture({ script, romaji, meaning, emoji }: WordPictureProps) {
  const path = `/images/kana/words/${script}/${romaji}.png`
  const [failed, setFailed] = useState(false)

  if (failed || !hasAsset(path)) {
    return (
      <span role="img" aria-label={meaning} className="select-none text-6xl leading-none sm:text-7xl">
        {emoji}
      </span>
    )
  }
  return (
    <img
      src={asset(path)}
      alt={meaning}
      width={SIZE}
      height={SIZE}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-28 w-28 select-none rounded-lg object-cover sm:h-36 sm:w-36"
      draggable={false}
    />
  )
})
