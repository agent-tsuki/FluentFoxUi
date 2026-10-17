import type { Ref } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { KanaChar } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import { kanaReadingLabel } from '@/lib/content/kana/kanaMarks'

/** Release past this distance (px) or flick faster than this (px/s) to grade. */
export const SWIPE_DISTANCE = 110
export const SWIPE_VELOCITY = 600

/** -1 flies left (Again), 1 flies right (Good/Easy), 0 drops down (Hard). */
export type SwipeDirection = -1 | 0 | 1

interface ReviewCardProps {
  kana: KanaChar
  revealed: boolean
  /** Drag is off before reveal, while saving, and under reduced motion. */
  draggable: boolean
  reducedMotion: boolean
  /** Where the card flies when it leaves (set just before grading). */
  exitDirection: SwipeDirection
  speechSupported: boolean
  onReveal: () => void
  onSwipe: (direction: -1 | 1) => void
  onSpeak: () => void
  /** Not `ref`: AnimatePresence children shouldn't carry a ref (framer reads it and React 18 warns). */
  cardRef?: Ref<HTMLDivElement>
}

/** `custom` for the variants; AnimatePresence passes the latest one to exiting cards. */
export interface CardMotionCustom {
  dir: SwipeDirection
  reduced: boolean
}

const cardVariants = {
  enter: ({ reduced }: CardMotionCustom) => (reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }),
  center: { opacity: 1, scale: 1, y: 0 },
  exit: ({ dir, reduced }: CardMotionCustom) =>
    reduced ? { opacity: 0 } : { opacity: 0, x: dir * 420, y: dir === 0 ? 40 : 0, rotate: dir * 14 },
}

/** Split "すし (sushi)" into the kana word and its reading. */
function splitWord(word: string): { ja: string; reading: string } {
  const match = /^(.*?)\s*\((.*)\)$/.exec(word)
  return match ? { ja: match[1] ?? word, reading: match[2] ?? '' } : { ja: word, reading: '' }
}

/** One flashcard: tap to reveal, then drag left/right (or use the buttons) to grade. */
export function ReviewCard({
  kana,
  revealed,
  draggable,
  reducedMotion,
  exitDirection,
  speechSupported,
  onReveal,
  onSwipe,
  onSpeak,
  cardRef,
}: ReviewCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-12, 12])
  const goodOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1])
  const againOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0])
  const script = useKanaScript()
  const sample = script.sampleWords[kana.id]
  const word = sample ? splitWord(sample.word) : null

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info
    if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onSwipe(1)
    else if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onSwipe(-1)
    else animate(x, 0, { type: 'spring', stiffness: 500, damping: 35 })
  }

  return (
    <motion.div
      ref={cardRef}
      tabIndex={-1}
      role="group"
      aria-roledescription="flashcard"
      aria-label={revealed ? `${kana.character}, ${kanaReadingLabel(kana)}` : `${script.label} card`}
      custom={{ dir: exitDirection, reduced: reducedMotion } satisfies CardMotionCustom}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
      style={reducedMotion ? undefined : { x, rotate }}
      drag={draggable ? 'x' : false}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 flex touch-pan-y select-none flex-col overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container-lowest shadow-elevation-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Colour hints that fade in with the drag distance. */}
      <motion.div aria-hidden="true" style={{ opacity: goodOpacity }} className="pointer-events-none absolute inset-0 flex items-start justify-end bg-success/10 p-5">
        <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success"><Icon name="thumb_up" className="text-lg" />Knew it</span>
      </motion.div>
      <motion.div aria-hidden="true" style={{ opacity: againOpacity }} className="pointer-events-none absolute inset-0 flex items-start justify-start bg-warning/10 p-5">
        <span className="flex items-center gap-1 rounded-full bg-warning/15 px-3 py-1 text-sm font-bold text-warning"><Icon name="thumb_down" className="text-lg" />Not yet</span>
      </motion.div>

      <div className="relative flex flex-1 items-center justify-center">
        <span lang="ja" className="font-jp text-8xl font-bold leading-none text-on-surface sm:text-9xl">{kana.character}</span>
      </div>

      {/* Answer area keeps its height before reveal so nothing shifts. */}
      <div aria-hidden={!revealed} className={revealed ? 'relative flex h-36 flex-col items-center justify-start gap-1 px-4' : 'invisible relative h-36'}>
        <div className="flex items-center gap-2">
          <p className="font-headline text-3xl font-extrabold text-primary">{kanaReadingLabel(kana)}</p>
          {speechSupported && (
            <button type="button" onClick={onSpeak} aria-label={`Play ${kanaReadingLabel(kana)}`} tabIndex={revealed ? 0 : -1} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Icon name="volume_up" className="text-2xl" />
            </button>
          )}
        </div>
        {word && sample && (
          <p className="text-center text-on-surface-variant">
            <span lang="ja" className="font-jp text-xl font-bold text-on-surface">{word.ja}</span>
            {word.reading && <span className="ml-1.5">{word.reading}</span>}
            <span className="block text-sm">{sample.meaning}</span>
          </p>
        )}
      </div>

      {!revealed && (
        <button type="button" onClick={onReveal} className="absolute inset-0 flex items-end justify-center rounded-3xl pb-14 text-sm font-semibold text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
          <span className="flex items-center gap-1.5"><Icon name="visibility" className="text-lg" />Tap to reveal</span>
        </button>
      )}
    </motion.div>
  )
}
