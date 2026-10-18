import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStartLearning } from '@/hooks/useStartLearning'
import { Icon } from '@/components/ui/Icon'
import { FallingPetals } from './FallingPetals'
import { asset } from '@/lib/assets'

const chapters = [
  { id: 'hiragana', number: '01', label: 'Hiragana', path: '/kana/hiragana' },
  { id: 'katakana', number: '02', label: 'Katakana', path: '/kana/katakana' },
  { id: 'kanji', number: '03', label: 'Kanji', path: '/kanji' },
  { id: 'vocabulary', number: '04', label: 'Vocabulary', path: '/classes' },
  { id: 'grammar', number: '05', label: 'Grammar', path: '/grammar/n5' },
] as const

const kanaReadings = [
  'あ · a · like the vowel in “father”',
  'い · i · like “ee” in “see”',
  'う · u · a short sound with relaxed lips',
  'え · e · like “e” in “bed”',
  'お · o · a pure o sound',
]

const vocabulary = [
  { emoji: '💧', value: '水 · みず · mizu · water', label: 'water' },
  { emoji: '🍵', value: 'お茶 · おちゃ · ocha · tea', label: 'tea' },
  { emoji: '🍚', value: 'ご飯 · ごはん · gohan · cooked rice / meal', label: 'rice' },
] as const

/**
 * A concept-led home page that directs learners into the real course routes.
 * The four small discovery panels offer local, optional interactions only;
 * learner progress continues to be owned by the established course features.
 */
export function ConceptHome() {
  const { startLearning, prefetch } = useStartLearning()
  const [kanaReading, setKanaReading] = useState('Tap a character to discover its sound.')
  const [coffeeRevealed, setCoffeeRevealed] = useState(false)
  const [forestStep, setForestStep] = useState(0)
  const [word, setWord] = useState('Tap an object to discover the word.')
  const [sentence, setSentence] = useState<string[]>([])

  const forest = [
    { character: '木', reading: '木 · ki · tree' },
    { character: '林', reading: '林 · hayashi · grove' },
    { character: '森', reading: '森 · mori · forest' },
  ]
  const sentenceComplete = sentence.length === 2
  const sentenceCorrect = sentence.join('') === '私は学生です'

  function addSentencePart(part: string) {
    setSentence((current) => (current.includes(part) ? current : [...current, part]))
  }

  return (
    <main className="concept-home overflow-x-clip bg-[#f7f6f0] text-[#253e35]">
      <section id="top" className="relative isolate h-[calc(100svh-5rem)] min-h-[37rem] overflow-hidden bg-[#cbdcc9]">
        <div
          className="absolute inset-0 scale-[1.03] bg-cover bg-[center_54%] motion-safe:animate-[concept-drift_25s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: `url('${asset('/images/home/journey.webp')}')` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,247,237,.94)_0%,rgba(248,247,237,.72)_30%,rgba(248,247,237,.08)_68%),linear-gradient(0deg,rgba(27,68,61,.32),transparent_35%)]" />
        <FallingPetals />

        <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-6 py-14 sm:px-10 lg:px-[6%]">
          <div className="max-w-[43rem] pb-7 pt-4">
            <p className="concept-eyebrow">A little curiosity goes a long way</p>
            <h1 className="concept-display mt-5 text-balance text-[clamp(3.25rem,5.25vw,5.4rem)] leading-[.96] tracking-[-.055em] text-[#253e35]">
              A little Japanese.
              <br />
              A whole
              <br />
              <em className="not-italic text-[#c65b39]">new world.</em>
            </h1>
            <p className="mt-5 max-w-[24rem] text-[0.9rem] leading-6 text-[#53665a] sm:text-[0.94rem] sm:leading-7">
              From your first あ to the stories you’ve always wanted to understand. Your Japanese journey starts with one small discovery.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                type="button"
                onClick={startLearning}
                {...prefetch}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#c65b39] px-5 py-3 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#ad482a] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#c65b39]"
              >
                Find my starting point
                <span className="grid size-5 place-items-center rounded-full border border-white/35 bg-white/10 transition-transform duration-200 group-hover:-translate-y-px" aria-hidden="true">
                  <Icon name="explore" className="text-sm" />
                </span>
              </button>
              <a className="concept-text-link" href="#journey">
                Explore the journey <Icon name="south" className="ml-1 align-text-bottom text-base" />
              </a>
            </div>
            <p className="mt-4 text-xs text-[#53665a]">At your pace. On your own path.</p>
          </div>
        </div>

        <div className="absolute bottom-5 left-[6%] right-[6%] z-10 flex items-center justify-between gap-4 text-[0.6rem] font-semibold tracking-[0.14em] text-white">
          <span className="rounded-full border border-white/30 bg-[#153d35]/30 px-4 py-3 backdrop-blur-sm" lang="ja">
            日本への旅 <span lang="en">/ YOUR JOURNEY TO JAPANESE</span>
          </span>
          <span className="hidden items-center gap-1 sm:flex">SCROLL TO DISCOVER <Icon name="south" className="text-sm" /></span>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-[#dfe3d8] px-6 py-5 text-xs sm:px-10 lg:px-[6%]">
        <p className="font-semibold">A guide for every stage of your journey.</p>
        <p className="hidden items-center gap-1.5 text-[#747c72] md:flex">
          Discover <Icon name="arrow_forward" className="text-sm" /> Practise <Icon name="arrow_forward" className="text-sm" /> Understand <Icon name="arrow_forward" className="text-sm" /> Grow
        </p>
        <Link className="concept-text-link" to="/dashboard">Your learning space <Icon name="arrow_forward" className="ml-1 align-text-bottom text-base" /></Link>
      </div>

      <section id="journey" className="scroll-mt-nav mx-auto max-w-[1240px] px-6 py-16 sm:px-10 lg:py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="concept-eyebrow">Follow your curiosity</p>
            <h2 className="concept-display mt-3 text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.03] tracking-[-.035em]">
              Five doors.
              <br />
              A world of possibilities.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#747c72]">
            Take a small step into each part of Japanese. Tap, discover, and try something new along the way.
          </p>
        </div>

        <div className="mt-10 grid gap-9 lg:grid-cols-[11.25rem_minmax(0,1fr)] lg:gap-10">
          <nav className="sticky top-nav z-20 -mx-6 flex overflow-x-auto border-y border-[#dfe3d8] bg-[#f7f6f0]/95 px-6 py-2 backdrop-blur lg:top-24 lg:mx-0 lg:block lg:self-start lg:border-0 lg:bg-transparent lg:p-0" aria-label="Learning chapters">
            <p className="mb-4 hidden text-[0.6rem] font-semibold tracking-[.16em] text-[#747c72] lg:block">YOUR JOURNEY / FOX SENSEI</p>
            <div className="flex min-w-max lg:block">
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`#chapter-${chapter.id}`}
                  className="block border-b-2 border-transparent px-3 py-2.5 text-xs text-[#747c72] transition hover:border-[#c65b39] hover:bg-[#eee8dc] hover:text-[#c65b39] lg:border-b-0 lg:border-l-2"
                >
                  {chapter.number} &nbsp; {chapter.label}
                </a>
              ))}
            </div>
          </nav>

          <div>
            <article id="chapter-hiragana" className="concept-chapter scroll-mt-36">
              <div>
                <p className="concept-chapter-number">01 / THE FIRST SOUNDS</p>
                <h3 className="concept-display mt-3 text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.05] tracking-[-.035em]">It begins with あ.</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#747c72]">Meet hiragana. A few simple shapes open the door to reading your first Japanese words.</p>
                <Link className="concept-text-link mt-4" to="/kana/hiragana">Meet your first characters <Icon name="arrow_forward" className="ml-1 align-text-bottom text-base" /></Link>
              </div>
              <div className="concept-mini bg-[#edeedf]">
                <p className="concept-mini-label">SMALL CHARACTERS. A BIG BEGINNING.</p>
                <div className="mt-6 flex justify-center gap-2 sm:gap-3">
                  {['あ', 'い', 'う', 'え', 'お'].map((kana, index) => (
                    <button
                      key={kana}
                      type="button"
                      onClick={() => setKanaReading(kanaReadings[index])}
                      className="min-h-14 min-w-0 max-w-[4.5rem] flex-1 rounded-lg border border-[#cdd7c6] bg-[#fffdf7] px-2 py-2 font-jp text-2xl text-[#253e35] transition hover:-translate-y-0.5 hover:border-[#c65b39] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c65b39] sm:text-3xl"
                      aria-label={`Reveal the reading of ${kana}`}
                    >
                      {kana}
                    </button>
                  ))}
                </div>
                <p className="mt-5 min-h-6 text-xs text-[#53665a]" aria-live="polite">{kanaReading}</p>
              </div>
            </article>

            <article id="chapter-katakana" className="concept-chapter scroll-mt-36">
              <div>
                <p className="concept-chapter-number">02 / THE FAMILIAR, REIMAGINED</p>
                <h3 className="concept-display mt-3 text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.05] tracking-[-.035em]">You know more<br />than you think.</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#747c72]">Coffee. Camera. Familiar words take on new shapes in katakana. Decode a little of everyday Japan.</p>
                <Link className="concept-text-link mt-4" to="/kana/katakana">Explore katakana <Icon name="arrow_forward" className="ml-1 align-text-bottom text-base" /></Link>
              </div>
              <div className="concept-mini bg-[#e6efec]">
                <p className="concept-mini-label">A SMALL STOP AT THE CAFÉ</p>
                <p className="mt-3 text-5xl" aria-hidden="true">☕</p>
                <button
                  type="button"
                  onClick={() => setCoffeeRevealed((value) => !value)}
                  className="mt-3 rounded-md border border-[#d7d8ca] bg-[#fffdf7] px-4 py-2 text-sm text-[#253e35] transition hover:border-[#c65b39] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c65b39]"
                  aria-pressed={coffeeRevealed}
                >
                  コーヒー <Icon name="refresh" className="ml-1 align-text-bottom text-base" />
                </button>
                <p className="mt-4 min-h-5 text-xs text-[#53665a]" aria-live="polite">
                  {coffeeRevealed ? 'kōhī · coffee — ー makes the vowel longer' : 'Tap to turn the word over.'}
                </p>
              </div>
            </article>

            <article id="chapter-kanji" className="concept-chapter scroll-mt-36">
              <div>
                <p className="concept-chapter-number">03 / A PICTURE OF MEANING</p>
                <h3 className="concept-display mt-3 text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.05] tracking-[-.035em]">One tree.<br />A thousand connections.</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#747c72]">Explore meaning through kanji, then discover how characters become the words you use.</p>
                <Link className="concept-text-link mt-4" to="/kanji">Discover kanji <Icon name="arrow_forward" className="ml-1 align-text-bottom text-base" /></Link>
              </div>
              <div className="concept-mini bg-[#edeedf]">
                <p className="concept-mini-label">WATCH THE MEANING GROW</p>
                <p className="mt-5 font-jp text-5xl tracking-[.3em] text-[#48705a]">{forest[forestStep].character}</p>
                <button
                  type="button"
                  onClick={() => setForestStep((value) => (value + 1) % forest.length)}
                  className="mt-4 rounded-md border border-[#d7d8ca] bg-[#fffdf7] px-4 py-2 text-sm text-[#253e35] transition hover:border-[#c65b39] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c65b39]"
                >
                  Grow a forest <Icon name="add" className="ml-1 align-text-bottom text-base" />
                </button>
                <p className="mt-4 min-h-5 text-xs text-[#53665a]" aria-live="polite">{forest[forestStep].reading}</p>
              </div>
            </article>

            <article id="chapter-vocabulary" className="concept-chapter scroll-mt-36">
              <div>
                <p className="concept-chapter-number">04 / WORDS THAT LIVE IN YOUR DAY</p>
                <h3 className="concept-display mt-3 text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.05] tracking-[-.035em]">Make the everyday<br />a little more Japanese.</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#747c72]">A cup of tea. A glass of water. Learn useful words in the moments where they belong.</p>
                <Link className="concept-text-link mt-4" to="/classes">Find your everyday words <Icon name="arrow_forward" className="ml-1 align-text-bottom text-base" /></Link>
              </div>
              <div className="concept-mini bg-[#f0e7df]">
                <p className="concept-mini-label">WHAT WOULD YOU LIKE?</p>
                <div className="mt-6 flex justify-center gap-3">
                  {vocabulary.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setWord(item.value)}
                      className="flex min-h-16 min-w-0 max-w-[5.5rem] flex-1 items-center justify-center rounded-lg border border-[#d7d8ca] bg-[#fffdf7] px-2 text-2xl transition hover:-translate-y-0.5 hover:border-[#c65b39] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c65b39]"
                      aria-label={`Discover the Japanese word for ${item.label}`}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
                <p className="mt-5 min-h-5 text-xs text-[#53665a]" aria-live="polite">{word}</p>
              </div>
            </article>

            <article id="chapter-grammar" className="concept-chapter scroll-mt-36">
              <div>
                <p className="concept-chapter-number">05 / YOUR FIRST CONNECTIONS</p>
                <h3 className="concept-display mt-3 text-[clamp(2rem,3.2vw,2.8rem)] leading-[1.05] tracking-[-.035em]">From little words<br />to your own ideas.</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#747c72]">Bring the pieces together. Learn how sentence patterns help you express something of your own.</p>
                <Link className="concept-text-link mt-4" to="/grammar/n5">Build your first sentence <Icon name="arrow_forward" className="ml-1 align-text-bottom text-base" /></Link>
              </div>
              <div className="concept-mini bg-[#e6efec]">
                <p className="concept-mini-label">ARRANGE: I AM A STUDENT.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['学生です', '私は'].map((part) => (
                    <button
                      key={part}
                      type="button"
                      disabled={sentence.includes(part)}
                      onClick={() => addSentencePart(part)}
                      className="rounded-md border border-[#d7d8ca] bg-[#fffdf7] px-3 py-2 font-jp text-base text-[#253e35] transition enabled:hover:border-[#c65b39] disabled:cursor-default disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#c65b39]"
                    >
                      {part}
                    </button>
                  ))}
                </div>
                <p className="mt-5 min-h-5 text-xs text-[#53665a]" aria-live="polite">
                  {!sentenceComplete && (sentence.length ? `${sentence[0]} …` : 'Tap the two parts in the right order.')}
                  {sentenceComplete && (sentenceCorrect ? '私は学生です。 · I am a student. Nicely done!' : 'Try 私は first, then 学生です. は marks the topic.')}
                </p>
                <button type="button" onClick={() => setSentence([])} className="mt-3 text-xs text-[#53665a] underline underline-offset-4 hover:text-[#c65b39]">Start again</button>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 rounded-xl bg-[#e8eddf] p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="concept-eyebrow">Your journey is your own</p>
            <h2 className="concept-display mt-3 text-[clamp(2rem,3vw,2.65rem)] leading-tight tracking-[-.03em]">Let’s find your starting point.</h2>
            <p className="mt-3 text-sm leading-7 text-[#53665a]">New to Japanese or finding your way back? Start at the pace that feels right.</p>
          </div>
          <button
            type="button"
            onClick={startLearning}
            {...prefetch}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-[#253e35] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#17332c] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#253e35]"
          >
            Find my path <Icon name="arrow_forward" className="ml-1 text-base" />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-16 sm:px-10 lg:pb-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="concept-eyebrow">A little better, every day</p>
            <h2 className="concept-display mt-3 text-[clamp(2.35rem,4vw,3.25rem)] leading-[1.05] tracking-[-.035em]">Learning that keeps moving.</h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#747c72]">A clear next step, useful feedback, and space to try again.</p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <BenefitCard symbol="道" title="A path that fits you." body="Start with a clear next step, then explore at your own pace." />
          <BenefitCard symbol="習" title="Mistakes become practice." body="Understand what went wrong and revisit it in focused review." />
          <BenefitCard symbol="進" title="See your small steps." body="Your dashboard reflects the learning you actually do, one answer at a time." />
        </div>
      </section>
    </main>
  )
}

function BenefitCard({ symbol, title, body }: { symbol: string; title: string; body: string }) {
  return (
    <article className="rounded-xl border border-[#dfe3d8] bg-[#fffdf7] p-7">
      <p className="concept-display text-4xl text-[#c65b39]" lang="ja">{symbol}</p>
      <h3 className="concept-display mt-4 text-2xl tracking-[-.02em]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#747c72]">{body}</p>
    </article>
  )
}
