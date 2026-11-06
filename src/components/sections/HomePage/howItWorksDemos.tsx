import { memo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'

/**
 * The four "Try it" demos beside the How FoxSensei works steps. Each owns its
 * own state, is local only (never touches learner progress) and keeps keyboard
 * focus on a live control whenever the one that was pressed disappears.
 */

/** Live feedback line under each demo; a fixed height keeps the panel from jumping. */
function Feedback({ children }: { children: ReactNode }) {
  return <p className="mt-5 min-h-12 text-base leading-6 text-home-muted" aria-live="polite">{children}</p>
}

function Ja({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span lang="ja" className={`font-jp ${className}`}>{children}</span>
}

/** Focus a control on the next frame, once React has rendered it. */
function focusSoon(element: () => HTMLElement | null | undefined) {
  requestAnimationFrame(() => element()?.focus())
}

// ── 01 Kana ──────────────────────────────────────────────────────────────────

// Each example word uses only these five vowels, so a beginner can read all of it.
const KANA = [
  { kana: 'あ', romaji: 'a', hint: 'like the a in “father”', word: 'あい', wordRomaji: 'ai', meaning: 'love' },
  { kana: 'い', romaji: 'i', hint: 'like the ee in “see”', word: 'いえ', wordRomaji: 'ie', meaning: 'house' },
  { kana: 'う', romaji: 'u', hint: 'like the oo in “food”, lips relaxed', word: 'うえ', wordRomaji: 'ue', meaning: 'above' },
  { kana: 'え', romaji: 'e', hint: 'like the e in “bed”', word: 'え', wordRomaji: 'e', meaning: 'picture' },
  { kana: 'お', romaji: 'o', hint: 'like the o in “go”, kept short', word: 'あお', wordRomaji: 'ao', meaning: 'blue' },
] as const

export const KanaDemo = memo(function KanaDemo() {
  const [selected, setSelected] = useState(0)
  const current = KANA[selected]

  return (
    <>
      {/* Flashcard: the character, how it sounds, and a real word made from it. */}
      <div aria-live="polite" className="flex flex-col items-center">
        <div key={current.kana} className="flex items-end justify-center gap-4 motion-safe:animate-[concept-fade_220ms_ease-out]">
          <Ja className="text-7xl leading-none text-home-ink sm:text-8xl">{current.kana}</Ja>
          <span className="concept-section-title pb-1 text-home-accent-hover">{current.romaji}</span>
        </div>
        <p className="mt-4 text-base text-home-muted">{current.hint}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-home-line bg-home-canvas px-4 py-1.5 text-sm text-home-muted">
          <span className="concept-label">In a word</span>
          <Ja className="text-base text-home-ink">{current.word}</Ja>
          <span>{current.wordRomaji} · {current.meaning}</span>
        </p>
      </div>

      <div className="mt-7 flex justify-center gap-2 sm:gap-3" role="group" aria-label="Choose a hiragana">
        {KANA.map((item, index) => (
          <button
            key={item.kana}
            type="button"
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className={`concept-kana-tile ${selected === index ? 'concept-kana-tile-on' : ''}`}
          >
            <Ja>{item.kana}</Ja>
          </button>
        ))}
      </div>
    </>
  )
})

// ── 02 Kanji ─────────────────────────────────────────────────────────────────

const FOREST = [
  { kanji: '木', reading: 'ki · tree' },
  { kanji: '林', reading: 'hayashi · grove — two trees' },
  { kanji: '森', reading: 'mori · forest — three trees' },
] as const

export const KanjiDemo = memo(function KanjiDemo() {
  const [step, setStep] = useState(0)
  const atEnd = step === FOREST.length - 1
  const current = FOREST[step]

  return (
    <>
      <p className="text-6xl leading-none text-home-leaf" aria-hidden="true">
        <Ja key={current.kanji} className="inline-block motion-safe:animate-[concept-fade_220ms_ease-out]">{current.kanji}</Ja>
      </p>
      <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
        {FOREST.map((item, index) => (
          <span key={item.kanji} className={`size-1.5 rounded-full ${index <= step ? 'bg-home-leaf' : 'bg-home-line-strong'}`} />
        ))}
      </div>
      <Feedback>
        <Ja className="text-home-ink">{current.kanji}</Ja> · {current.reading}
      </Feedback>
      {/* Same button throughout, so focus never moves. */}
      <button type="button" onClick={() => setStep(atEnd ? 0 : step + 1)} className="concept-demo-btn">
        {atEnd ? 'Start again' : 'Add a tree'}
        <Icon name={atEnd ? 'replay' : 'add'} className="text-base" />
      </button>
    </>
  )
})

// ── 03 Grammar ───────────────────────────────────────────────────────────────

const SENTENCE_PARTS = ['学生です', '私は'] as const
const SENTENCE_ANSWER = '私は学生です'

export const GrammarDemo = memo(function GrammarDemo() {
  const [order, setOrder] = useState<string[]>([])
  const partsRef = useRef<HTMLDivElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const done = order.length === SENTENCE_PARTS.length
  const correct = order.join('') === SENTENCE_ANSWER
  const remaining = SENTENCE_PARTS.filter((part) => !order.includes(part))

  function place(part: string) {
    const next = [...order, part]
    setOrder(next)
    // The pressed part disappears: move focus to the next part, or to Try again.
    focusSoon(() => (next.length === SENTENCE_PARTS.length ? resetRef.current : partsRef.current?.querySelector('button')))
  }

  function reset() {
    setOrder([])
    focusSoon(() => partsRef.current?.querySelector('button'))
  }

  function slotClass(index: number): string {
    if (done) return correct ? 'border-home-leaf bg-home-tile text-home-ink' : 'border-home-accent bg-home-tile text-home-ink'
    return order[index] ? 'border-home-line-strong bg-home-tile text-home-ink' : 'border-dashed border-home-line-strong text-home-muted'
  }

  return (
    <>
      <div className="flex justify-center gap-2" aria-hidden="true">
        {SENTENCE_PARTS.map((_, index) => (
          <Ja key={index} className={`grid min-h-11 min-w-24 place-items-center rounded-xl border px-3 text-lg ${slotClass(index)}`}>
            {order[index] ?? '…'}
          </Ja>
        ))}
      </div>
      <div ref={partsRef} className="mt-4 flex min-h-11 justify-center gap-2">
        {remaining.map((part) => (
          <button key={part} type="button" onClick={() => place(part)} className="concept-demo-btn text-base">
            <Ja>{part}</Ja>
          </button>
        ))}
      </div>
      <Feedback>
        {!done && (order.length ? <>Good start: <Ja>{order[0]}</Ja> is placed. Now the other part.</> : 'Tap the two parts in order.')}
        {done && correct && <><Ja className="text-home-ink">私は学生です。</Ja> I am a student. <Ja>は</Ja> marks the topic.</>}
        {done && !correct && <>Almost. Put <Ja>私は</Ja> first — <Ja>は</Ja> marks the topic.</>}
      </Feedback>
      <button
        ref={resetRef}
        type="button"
        onClick={reset}
        disabled={order.length === 0}
        className="concept-demo-btn disabled:invisible"
      >
        Try again <Icon name="replay" className="text-base" />
      </button>
    </>
  )
})

// ── 04 Review ────────────────────────────────────────────────────────────────

// N5 kanji only, so the demo shows cards a learner really meets in the course.
const REVIEW_CARDS = [
  { kanji: '山', answer: 'mountain', choices: ['river', 'mountain', 'tree'] },
  { kanji: '水', answer: 'water', choices: ['water', 'fire', 'rain'] },
  { kanji: '日', answer: 'day / sun', choices: ['moon', 'person', 'day / sun'] },
] as const

export const ReviewDemo = memo(function ReviewDemo() {
  const [cardIndex, setCardIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const choicesRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const card = REVIEW_CARDS[cardIndex]
  const right = picked === card.answer

  function pick(choice: string) {
    setPicked(choice)
    // Choices are now disabled: keyboard users land on "Next card".
    focusSoon(() => nextRef.current)
  }

  function next() {
    setPicked(null)
    setCardIndex((index) => (index + 1) % REVIEW_CARDS.length)
    focusSoon(() => choicesRef.current?.querySelector('button'))
  }

  function choiceClass(choice: string): string {
    if (picked === null) return ''
    if (choice === card.answer) return 'concept-demo-btn-right'
    return choice === picked ? 'concept-demo-btn-wrong' : 'opacity-50'
  }

  return (
    <>
      <p className="text-6xl leading-none text-home-ink"><Ja>{card.kanji}</Ja></p>
      <p className="mt-3 text-sm text-home-muted">What does it mean?</p>
      <div ref={choicesRef} className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2">
        {card.choices.map((choice) => (
          <button key={choice} type="button" disabled={picked !== null} onClick={() => pick(choice)} className={`concept-demo-btn px-2 ${choiceClass(choice)}`}>
            {choice}
          </button>
        ))}
      </div>
      <Feedback>
        {picked === null && 'Pick an answer. FoxSensei grades it for you.'}
        {picked !== null && (right
          ? <><strong className="text-home-ink">Good.</strong> It comes back after a longer gap.</>
          : <><strong className="text-home-ink">Missed.</strong> It comes back soon, so you get another go.</>)}
      </Feedback>
      <button ref={nextRef} type="button" onClick={next} disabled={picked === null} className="concept-demo-btn disabled:invisible">
        Next card <Icon name="arrow_forward" className="text-base" />
      </button>
    </>
  )
})
